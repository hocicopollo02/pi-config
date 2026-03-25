/**
 * Minimal — footer limpio: modelo a la izquierda, contexto restante a la derecha.
 *
 * Si el modelo actual usa el provider openai-codex, también muestra el status de
 * `codex-usage` junto al modelo.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applyExtensionDefaults } from "./themeMap.ts";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

function isCodexModel(provider: string | undefined, modelId: string | undefined): boolean {
	return provider === "openai-codex" || Boolean(modelId && modelId.toLowerCase().includes("codex"));
}

function formatContextLeft(usedPercent: number | null | undefined): string {
	if (typeof usedPercent !== "number" || Number.isNaN(usedPercent)) {
		return "ctx [??????????] ?% left";
	}

	const leftPercent = Math.max(0, Math.min(100, Math.round(100 - usedPercent)));
	const filled = Math.round(leftPercent / 10);
	const bar = "#".repeat(filled) + "-".repeat(10 - filled);
	return `ctx [${bar}] ${leftPercent}% left`;
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		applyExtensionDefaults(import.meta.url, ctx);
		ctx.ui.setFooter((_tui, theme, footerData) => ({
			dispose: () => {},
			invalidate() {},
			render(width: number): string[] {
				const provider = ctx.model?.provider;
				const model = ctx.model?.id || "no-model";
				const codexStatus = footerData.getExtensionStatuses().get("codex-usage");
				const left = isCodexModel(provider, model) && codexStatus
					? theme.fg("dim", model) + theme.fg("dim", "  ·  ") + codexStatus
					: theme.fg("dim", model);

				const usage = ctx.getContextUsage();
				const right = theme.fg("dim", formatContextLeft(usage?.percent));

				const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));
				return [truncateToWidth(left + pad + right, width)];
			},
		}));
	});
}
