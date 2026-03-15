import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType, parseFrontmatter } from "@mariozechner/pi-coding-agent";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { applyExtensionDefaults } from "./themeMap.ts";

interface Rule {
	pattern: string;
	reason: string;
	ask?: boolean;
	flags?: string;
}

interface Rules {
	bashToolPatterns: Rule[];
	zeroAccessPaths: string[];
	readOnlyPaths: string[];
	noDeletePaths: string[];
}

function loadRulesFromYaml(content: string): Partial<Rules> {
	const { frontmatter } = parseFrontmatter<Partial<Rules>>(`---\n${content}\n---`);
	return frontmatter;
}

export default function (pi: ExtensionAPI) {
	let rules: Rules = {
		bashToolPatterns: [],
		zeroAccessPaths: [],
		readOnlyPaths: [],
		noDeletePaths: [],
	};

	function resolvePath(p: string, cwd: string): string {
		if (p.startsWith("~")) {
			p = path.join(os.homedir(), p.slice(1));
		}
		return path.resolve(cwd, p);
	}

	function isPathMatch(targetPath: string, pattern: string, cwd: string): boolean {
		const resolvedPattern = pattern.startsWith("~") ? path.join(os.homedir(), pattern.slice(1)) : pattern;

		if (resolvedPattern.endsWith("/")) {
			const absolutePattern = path.isAbsolute(resolvedPattern) ? resolvedPattern : path.resolve(cwd, resolvedPattern);
			const normalizedPattern = absolutePattern.replace(/\/+$/, "");
			const normalizedTarget = targetPath.replace(/\/+$/, "");
			return normalizedTarget === normalizedPattern || normalizedTarget.startsWith(normalizedPattern + path.sep);
		}

		const regexPattern = resolvedPattern
			.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			.replace(/\*/g, ".*");

		const regex = new RegExp(`^${regexPattern}$|^${regexPattern}/|/${regexPattern}$|/${regexPattern}/`);
		const relativePath = path.relative(cwd, targetPath);

		return regex.test(targetPath) || regex.test(relativePath) || targetPath.includes(resolvedPattern) || relativePath.includes(resolvedPattern);
	}

	function isLikelyMutatingBashCommand(command: string): boolean {
		const mutationPatterns = [
			/\b(rm|rmdir|mv|cp|install|tee|touch|truncate|chmod|chown)\b/,
			/\bsed\s+-i\b/,
			/\bperl\s+-p[iI]\b/,
			/\bpython\d*\s+-c\b/,
			/\bnode\s+-e\b/,
			/\bruby\s+-e\b/,
			/(^|[^>])>(?!>)/,
			/>>/,
		];

		return mutationPatterns.some((pattern) => pattern.test(command));
	}

	function logBlockedAction(toolName: string, input: unknown, rule: string, action: string) {
		pi.appendEntry("damage-control-log", { tool: toolName, input, rule, action });
	}

	pi.on("session_start", async (_event, ctx) => {
		applyExtensionDefaults(import.meta.url, ctx);
		const projectRulesPath = path.join(ctx.cwd, ".pi", "damage-control-rules.yaml");
		const globalRulesPath = path.join(os.homedir(), ".pi", "damage-control-rules.yaml");
		const rulesPath = fs.existsSync(projectRulesPath) ? projectRulesPath : fs.existsSync(globalRulesPath) ? globalRulesPath : null;
		try {
			if (rulesPath) {
				const content = fs.readFileSync(rulesPath, "utf8");
				const loaded = loadRulesFromYaml(content);
				rules = {
					bashToolPatterns: loaded.bashToolPatterns || [],
					zeroAccessPaths: loaded.zeroAccessPaths || [],
					readOnlyPaths: loaded.readOnlyPaths || [],
					noDeletePaths: loaded.noDeletePaths || [],
				};
				const source = rulesPath === projectRulesPath ? "project" : "global";
				ctx.ui.notify(`🛡️ Damage-Control: Loaded ${rules.bashToolPatterns.length + rules.zeroAccessPaths.length + rules.readOnlyPaths.length + rules.noDeletePaths.length} rules (${source}).`);
			} else {
				ctx.ui.notify("🛡️ Damage-Control: No rules found at .pi/damage-control-rules.yaml (project or global)");
			}
		} catch (err) {
			ctx.ui.notify(`🛡️ Damage-Control: Failed to load rules: ${err instanceof Error ? err.message : String(err)}`);
		}

		ctx.ui.setStatus(`🛡️ Damage-Control Active: ${rules.bashToolPatterns.length + rules.zeroAccessPaths.length + rules.readOnlyPaths.length + rules.noDeletePaths.length} Rules`);
	});

	pi.on("tool_call", async (event, ctx) => {
		let violationReason: string | null = null;
		let shouldAsk = false;

		const checkPaths = (pathsToCheck: string[]) => {
			for (const p of pathsToCheck) {
				const resolved = resolvePath(p, ctx.cwd);
				for (const zap of rules.zeroAccessPaths) {
					if (isPathMatch(resolved, zap, ctx.cwd)) {
						return `Access to zero-access path restricted: ${zap}`;
					}
				}
			}
			return null;
		};

		const inputPaths: string[] = [];
		if (isToolCallEventType("read", event) || isToolCallEventType("write", event) || isToolCallEventType("edit", event)) {
			inputPaths.push(event.input.path);
		} else if (isToolCallEventType("grep", event) || isToolCallEventType("find", event) || isToolCallEventType("ls", event)) {
			inputPaths.push(event.input.path || ".");
		}

		if (isToolCallEventType("grep", event) && event.input.glob) {
			for (const zap of rules.zeroAccessPaths) {
				if (event.input.glob.includes(zap) || isPathMatch(event.input.glob, zap, ctx.cwd)) {
					violationReason = `Glob matches zero-access path: ${zap}`;
					break;
				}
			}
		}

		if (!violationReason) {
			violationReason = checkPaths(inputPaths);
		}

		if (!violationReason) {
			if (isToolCallEventType("bash", event)) {
				const command = event.input.command;

				for (const rule of rules.bashToolPatterns) {
					const regex = new RegExp(rule.pattern, rule.flags || "");
					if (regex.test(command)) {
						violationReason = rule.reason;
						shouldAsk = !!rule.ask;
						break;
					}
				}

				if (!violationReason) {
					for (const zap of rules.zeroAccessPaths) {
						if (command.includes(zap)) {
							violationReason = `Bash command references zero-access path: ${zap}`;
							break;
						}
					}
				}

				if (!violationReason && isLikelyMutatingBashCommand(command)) {
					for (const rop of rules.readOnlyPaths) {
						if (command.includes(rop)) {
							violationReason = `Bash command may modify protected path: ${rop}`;
							shouldAsk = true;
							break;
						}
					}
				}

				if (!violationReason) {
					for (const ndp of rules.noDeletePaths) {
						if (command.includes(ndp) && /\b(rm|rmdir|mv)\b/.test(command)) {
							violationReason = `Bash command attempts to delete/move protected path: ${ndp}`;
							break;
						}
					}
				}
			} else if (isToolCallEventType("write", event) || isToolCallEventType("edit", event)) {
				for (const p of inputPaths) {
					const resolved = resolvePath(p, ctx.cwd);
					for (const rop of rules.readOnlyPaths) {
						if (isPathMatch(resolved, rop, ctx.cwd)) {
							violationReason = `Modification of protected path requires confirmation: ${rop}`;
							shouldAsk = true;
							break;
						}
					}
					if (violationReason) break;
				}
			}
		}

		if (violationReason) {
			if (shouldAsk && !ctx.hasUI) {
				logBlockedAction(event.toolName, event.input, violationReason, "blocked_no_ui_confirmation_required");
				ctx.abort();
				return {
					block: true,
					reason: `🛑 BLOCKED by Damage-Control: ${violationReason} (interactive confirmation required, but UI is unavailable)\n\nDO NOT attempt to work around this restriction. Report the block to the user and ask for a safer or interactive path.`,
				};
			}

			if (shouldAsk) {
				const confirmed = await ctx.ui.confirm(
					"🛡️ Damage-Control Confirmation",
					`Dangerous command detected: ${violationReason}\n\nCommand: ${isToolCallEventType("bash", event) ? event.input.command : JSON.stringify(event.input)}\n\nDo you want to proceed?`,
					{ timeout: 30000 },
				);

				if (!confirmed) {
					ctx.ui.setStatus(`⚠️ Last Violation Blocked: ${violationReason.slice(0, 30)}...`);
					logBlockedAction(event.toolName, event.input, violationReason, "blocked_by_user");
					ctx.abort();
					return {
						block: true,
						reason: `🛑 BLOCKED by Damage-Control: ${violationReason} (User denied)\n\nDO NOT attempt to work around this restriction. DO NOT retry with alternative commands, paths, or approaches that achieve the same result. Report this block to the user exactly as stated and ask how they would like to proceed.`,
					};
				}

				logBlockedAction(event.toolName, event.input, violationReason, "confirmed_by_user");
				return { block: false };
			}

			ctx.ui.notify(`🛑 Damage-Control: Blocked ${event.toolName} due to ${violationReason}`);
			ctx.ui.setStatus(`⚠️ Last Violation: ${violationReason.slice(0, 30)}...`);
			logBlockedAction(event.toolName, event.input, violationReason, "blocked");
			ctx.abort();
			return {
				block: true,
				reason: `🛑 BLOCKED by Damage-Control: ${violationReason}\n\nDO NOT attempt to work around this restriction. DO NOT retry with alternative commands, paths, or approaches that achieve the same result. Report this block to the user exactly as stated and ask how they would like to proceed.`,
			};
		}

		return { block: false };
	});
}
