import { MCPClient } from "mcp-use/client";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getSettingsCandidatePaths, loadSettings } from "./settings-resolver.js";
import type { LoadedSettings, ResolveOptions, WorkspaceResolution } from "./types.js";
import { resolveWorkspace } from "./workspace-resolver.js";

const CHILD_SERVER_NAME = "vs-mcp";
const STATUS_TOOL_NAME = "smart_vs_mcp_status";

type SessionState = {
  endpoint: string;
  client: MCPClient;
  session: Awaited<ReturnType<MCPClient["createSession"]>>;
};

export async function runProxyServer(options: ResolveOptions): Promise<void> {
  let state: SessionState | undefined;

  const resolveLoadedSettings = (): { workspace: WorkspaceResolution; loaded?: LoadedSettings; error?: string } => {
    const workspace = resolveWorkspace(options);
    try {
      return { workspace, loaded: loadSettings(workspace.workspace, options.env) };
    } catch (error) {
      return {
        workspace,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const getSession = async () => {
    const resolved = resolveLoadedSettings();
    if (!resolved.loaded) {
      throw new Error(buildStatusText(resolved.workspace, undefined, resolved.error));
    }

    const loaded = resolved.loaded;
    if (state?.endpoint === loaded.endpoint && state.session.isConnected) {
      return state.session;
    }

    if (state) {
      await state.client.closeAllSessions();
    }

    const client = new MCPClient({
      mcpServers: {
        [CHILD_SERVER_NAME]: {
          url: loaded.endpoint,
        },
      },
    });

    const session = await client.createSession(CHILD_SERVER_NAME);
    state = { endpoint: loaded.endpoint, client, session };
    return session;
  };

  const server = new Server(
    {
      name: "smart-vs-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: true, subscribe: true },
        prompts: { listChanged: true },
      },
      instructions: "Workspace-aware VS-MCP proxy. Use smart_vs_mcp_status when no workspace config is available.",
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const resolved = resolveLoadedSettings();
    const statusTool = createStatusTool(resolved.workspace, resolved.loaded, resolved.error);

    if (!resolved.loaded) {
      return { tools: [statusTool] };
    }

    try {
      const session = await getSession();
      const tools = await session.listTools();
      return { tools: [statusTool, ...tools.filter((tool) => tool.name !== STATUS_TOOL_NAME)] };
    } catch {
      return { tools: [statusTool] };
    }
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === STATUS_TOOL_NAME) {
      const resolved = resolveLoadedSettings();
      return {
        content: [
          {
            type: "text",
            text: buildStatusText(resolved.workspace, resolved.loaded, resolved.error),
          },
        ],
      };
    }

    const session = await getSession();
    return session.callTool(request.params.name, request.params.arguments ?? {});
  });

  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const resolved = resolveLoadedSettings();
    if (!resolved.loaded) {
      return { resources: [] };
    }

    const session = await getSession();
    return session.listResources(request.params?.cursor);
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const session = await getSession();
    return session.readResource(request.params.uri);
  });

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    const resolved = resolveLoadedSettings();
    if (!resolved.loaded) {
      return { resourceTemplates: [] };
    }

    const session = await getSession();
    return session.listResourceTemplates();
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    const resolved = resolveLoadedSettings();
    if (!resolved.loaded) {
      return { prompts: [] };
    }

    const session = await getSession();
    return session.listPrompts();
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const session = await getSession();
    return session.getPrompt(request.params.name, request.params.arguments ?? {});
  });

  const startup = resolveLoadedSettings();
  process.stderr.write(
    startup.loaded
      ? `smart-vs-mcp workspace=${startup.workspace.workspace} endpoint=${startup.loaded.endpoint}\n`
      : `smart-vs-mcp diagnostic-mode workspace=${startup.workspace.workspace} error=${startup.error}\n`,
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function createStatusTool(workspace: WorkspaceResolution, loaded?: LoadedSettings, error?: string) {
  return {
    name: STATUS_TOOL_NAME,
    description: "Show smart-vs-mcp workspace, settings, endpoint, and recovery diagnostics.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
    },
    _meta: {
      workspace: workspace.workspace,
      endpoint: loaded?.endpoint,
      error,
    },
  };
}

function buildStatusText(workspace: WorkspaceResolution, loaded?: LoadedSettings, error?: string): string {
  const candidates = getSettingsCandidatePaths(workspace.workspace);
  const lines = [
    "smart-vs-mcp status",
    `Workspace: ${workspace.workspace}`,
    `Workspace Source: ${workspace.source}`,
    `Start Path: ${workspace.startPath}`,
  ];

  if (workspace.solutionPath) {
    lines.push(`Solution: ${workspace.solutionPath}`);
  }

  if (loaded) {
    lines.push(`Settings: ${loaded.sourcePath}`);
    lines.push(`Endpoint: ${loaded.endpoint}`);
    lines.push("Proxy: ready");
  } else {
    lines.push("Proxy: diagnostic mode");
    if (error) {
      lines.push(`Error: ${error}`);
    }
    lines.push("Expected settings:");
    lines.push(...candidates.map((candidate) => `- ${candidate}`));
    lines.push("Fix: launch from a solution workspace, pass --workspace <repo>, create %LOCALAPPDATA%\\MsvcInfo\\mcpserver.settings.json, set SMART_VS_MCP_CONFIG, or create %USERPROFILE%\\.smart-vs-mcp\\mcpserver.settings.json.");
  }

  return lines.join("\n");
}
