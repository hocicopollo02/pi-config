/**
 * UV Extension (Event-based) - Enforces uv usage via bash tool event interception
 *
 * Instead of registering a new bash tool (which conflicts with pi-bash-live-view),
 * this extension listens to tool_call events for bash and blocks problematic commands
 * with helpful messages directing users to uv equivalents.
 *
 * Blocked commands:
 * - pip/pip3: Blocked with suggestions to use `uv add` or `uv run --with`
 * - poetry: Blocked with uv equivalents (uv init, uv add, uv sync, uv run)
 * - python -m pip/venv/py_compile: Blocked with uv alternatives
 */

import type { ExtensionAPI, BashToolCallEvent } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

function getBlockedCommandMessage(command: string): string | null {
  const pipCommandPattern = /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?pip\s*(?:$|\s)/m;
  const pip3CommandPattern = /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?pip3\s*(?:$|\s)/m;
  const poetryCommandPattern = /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?poetry\s*(?:$|\s)/m;
  const pythonPipPattern =
    /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?python(?:3(?:\.\d+)?)?\b[^\n;|&]*(?:\s-m\s*pip\b|\s-mpip\b)/m;
  const pythonVenvPattern =
    /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?python(?:3(?:\.\d+)?)?\b[^\n;|&]*(?:\s-m\s*venv\b|\s-mvenv\b)/m;
  const pythonPyCompilePattern =
    /(?:^|\n|[;|&]{1,2})\s*(?:\S+\/)?python(?:3(?:\.\d+)?)?\b[^\n;|&]*(?:\s-m\s*py_compile\b|\s-mpy_compile\b)/m;

  if (pipCommandPattern.test(command)) {
    return [
      "Error: pip is disabled. Use uv instead:",
      "  To add a dependency: uv add PACKAGE",
      "  To run a script with deps: uv run --with PACKAGE python script.py",
    ].join("\n");
  }

  if (pip3CommandPattern.test(command)) {
    return [
      "Error: pip3 is disabled. Use uv instead:",
      "  To add a dependency: uv add PACKAGE",
      "  To run a script with deps: uv run --with PACKAGE python script.py",
    ].join("\n");
  }

  if (poetryCommandPattern.test(command)) {
    return [
      "Error: poetry is disabled. Use uv instead:",
      "  To init: uv init",
      "  To add deps: uv add PACKAGE",
      "  To sync: uv sync",
      "  To run: uv run COMMAND",
    ].join("\n");
  }

  if (pythonPipPattern.test(command)) {
    return "Error: 'python -m pip' is disabled. Use 'uv add PACKAGE' or 'uv run --with PACKAGE python script.py' instead.";
  }

  if (pythonVenvPattern.test(command)) {
    return "Error: 'python -m venv' is disabled. Use 'uv venv' instead.";
  }

  if (pythonPyCompilePattern.test(command)) {
    return "Error: 'python -m py_compile' is disabled. Use 'uv run python -m ast path/to/file.py >/dev/null' instead.";
  }

  return null;
}

export default function (pi: ExtensionAPI) {
  // Intercept bash tool calls and block disallowed commands
  pi.on("tool_call", async (event, ctx) => {
    if (!isToolCallEventType("bash", event)) {
      return; // Not a bash call, ignore
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
