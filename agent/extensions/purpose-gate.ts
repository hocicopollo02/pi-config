/**
 * Purpose Gate (global) — obliga a declarar objetivo de sesión
 *
 * Comportamiento:
 * - Al iniciar sesión (UI interactiva), pide un propósito obligatorio.
 * - Muestra el propósito en widget + status line.
 * - Bloquea prompts hasta que exista propósito.
 * - Inyecta el propósito en el system prompt en cada arranque de agente.
 *
 * Nota: en modo no interactivo / sin UI, no bloquea para evitar romper automatizaciones.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";
import { applyExtensionDefaults } from "./themeMap.ts";

export default function (pi: ExtensionAPI) {
	let purpose: string | undefined;
	let bootstrapping = false;

	function renderPurpose(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;

		if (!purpose) {
			ctx.ui.setWidget("purpose-gate", undefined);
			ctx.ui.setStatus("purpose-gate", "🎯 Purpose: pendiente");
			return;
		}

		ctx.ui.setStatus("purpose-gate", `🎯 ${purpose}`);
		ctx.ui.setWidget(
			"purpose-gate",
			(_tui, theme) => ({
				invalidate() {},
				render(width: number): string[] {
					const top = theme.fg("borderMuted", "─".repeat(Math.max(0, width)));
					const label = theme.fg("accent", " 🎯 PURPOSE ") + theme.fg("muted", purpose || "");
					return [top, truncateToWidth(label, width), top];
				},
			}),
			{ placement: "belowEditor" },
		);
	}

	async function ensurePurpose(ctx: ExtensionContext) {
		if (!ctx.hasUI || purpose || bootstrapping) return;
		bootstrapping = true;
		try {
			while (!purpose) {
				const answer = await ctx.ui.input(
					"¿Cuál es el propósito de esta sesión?",
					"Ej: implementar auth JWT + tests + docs",
				);

				if (answer && answer.trim()) {
					purpose = answer.trim();
					renderPurpose(ctx);
					ctx.ui.notify("Purpose definido. Seguimos enfocados en ese objetivo.", "success");
					break;
				}

				ctx.ui.notify("El propósito es obligatorio para empezar.", "warning");
			}
		} finally {
			bootstrapping = false;
		}
	}

	pi.registerCommand("purpose", {
		description: "Ver o actualizar propósito. Uso: /purpose <objetivo>",
		handler: async (args, ctx) => {
			if (!ctx.hasUI) return;

			const next = args.trim();
			if (!next) {
				if (purpose) {
					ctx.ui.notify(`🎯 Purpose actual: ${purpose}`, "info");
					return;
				}
				await ensurePurpose(ctx);
				return;
			}

			purpose = next;
			renderPurpose(ctx);
			ctx.ui.notify("Purpose actualizado.", "success");
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		purpose = undefined;
		bootstrapping = false;
		applyExtensionDefaults(import.meta.url, ctx);
		renderPurpose(ctx);
		await ensurePurpose(ctx);
	});

	pi.on("before_agent_start", async (event) => {
		if (!purpose) return;
		return {
			systemPrompt:
				event.systemPrompt +
				`\n\n<purpose>\nObjetivo obligatorio de esta sesión: ${purpose}\nMantente enfocado en este objetivo. Si una petición se desvía, avisa con tacto y propone volver al objetivo.\n</purpose>`,
		};
	});

	pi.on("input", async (_event, ctx) => {
		if (!ctx.hasUI) return { action: "continue" as const };
		if (purpose) return { action: "continue" as const };

		ctx.ui.notify("Definí primero el propósito de la sesión.", "warning");
		void ensurePurpose(ctx);
		return { action: "handled" as const };
	});
}
