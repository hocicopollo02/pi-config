/**
 * PNPM Extension (Event-based) - Enforces pnpm usage via bash tool event interception
 *
 * Similar to uv.ts: intercepts bash tool calls and blocks package-manager commands
 * outside pnpm, with actionable replacements.
 *
 * Blocked commands:
 * - npm: Blocked with suggestions for pnpm add/run/exec
 * - npx: Blocked with suggestion to use pnpm dlx
 * - yarn: Blocked with pnpm equivalents
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

function getBlockedCommandMessage(command: string): string | null {
  const npmCommandPattern = /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?npm(?:\.cmd)?\s*(?:$|\s)/m;
  const npxCommandPattern = /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?npx(?:\.cmd)?\s*(?:$|\s)/m;
  const yarnCommandPattern = /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?yarn(?:pkg)?(?:\.cmd)?\s*(?:$|\s)/m;
  const corepackNpmPattern =
    /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?corepack\b[^\n;|&]*\bnpm\b/m;
  const corepackYarnPattern =
    /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?corepack\b[^\n;|&]*\byarn\b/m;

  if (npmCommandPattern.test(command) || corepackNpmPattern.test(command)) {
    return [
      "Error: npm is disabled. Use pnpm instead:",
      "  To add a dependency: pnpm add PACKAGE",
      "  To add a dev dependency: pnpm add -D PACKAGE",
      "  To run scripts: pnpm run SCRIPT (or pnpm SCRIPT)",
      "  To execute a binary: pnpm exec COMMAND",
    ].join("\n");
  }

  if (npxCommandPattern.test(command)) {
    return [
      "Error: npx is disabled. Use pnpm dlx instead:",
      "  Example: pnpm dlx create-vite@latest my-app",
      "  Example: pnpm dlx tsx script.ts",
    ].join("\n");
  }

  if (yarnCommandPattern.test(command) || corepackYarnPattern.test(command)) {
    return [
      "Error: yarn is disabled. Use pnpm instead:",
      "  To add a dependency: pnpm add PACKAGE",
      "  To install dependencies: pnpm install",
      "  To run scripts: pnpm run SCRIPT (or pnpm SCRIPT)",
      "  For one-off executables: pnpm dlx PACKAGE",
    ].join("\n");
  }

  return null;
}

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event) => {
    if (!isToolCallEventType("bash", event)) {
      return;
    }

    const command = event.input.command;
    const blockedMessage = getBlockedCommandMessage(command);

    if (blockedMessage) {
      return {
        block: true,
        reason: blockedMessage,
      };
    }
  });
}
