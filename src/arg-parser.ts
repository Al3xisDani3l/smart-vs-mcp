export type ParsedArgs = {
  command: "serve" | "doctor" | "status" | "list" | "scan";
  workspaceArg?: string;
  help: boolean;
  version: boolean;
};

const COMMANDS = new Set(["doctor", "status", "list", "scan"]);

export function parseArgs(args: string[]): ParsedArgs {
  let command: ParsedArgs["command"] = "serve";
  let workspaceArg: string | undefined;
  let help = false;
  let version = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg === "--version" || arg === "-v") {
      version = true;
      continue;
    }

    if (arg === "--workspace") {
      workspaceArg = args[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--workspace=")) {
      workspaceArg = arg.slice("--workspace=".length);
      continue;
    }

    if (COMMANDS.has(arg)) {
      command = arg as ParsedArgs["command"];
    }
  }

  return { command, workspaceArg, help, version };
}
