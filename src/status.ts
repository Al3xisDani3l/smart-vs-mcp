import { checkEndpointHealth } from "./endpoint-health.js";
import { loadSettings } from "./settings-resolver.js";
import type { ResolveOptions, StatusResult } from "./types.js";
import { resolveWorkspace } from "./workspace-resolver.js";

export async function getStatus(options: ResolveOptions): Promise<StatusResult> {
  const workspace = resolveWorkspace(options);

  try {
    const settings = loadSettings(workspace.workspace, options.env);
    const health = await checkEndpointHealth(settings.endpoint);
    return { workspace, settings, health };
  } catch (error) {
    return {
      workspace,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
