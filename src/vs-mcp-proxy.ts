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
import { loadSettings } from "./settings-resolver.js";
import type { ResolveOptions } from "./types.js";
import { resolveWorkspace } from "./workspace-resolver.js";

const CHILD_SERVER_NAME = "vs-mcp";

type SessionState = {
  endpoint: string;
  client: MCPClient;
  session: Awaited<ReturnType<MCPClient["createSession"]>>;
};

export async function runProxyServer(options: ResolveOptions): Promise<void> {
  const workspace = resolveWorkspace(options);
  const loaded = loadSettings(workspace.workspace, options.env);
  let state: SessionState | undefined;

  const getSession = async () => {
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
      instructions: `Workspace-aware VS-MCP proxy. Workspace: ${workspace.workspace}. Endpoint: ${loaded.endpoint}.`,
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const session = await getSession();
    const tools = await session.listTools();
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const session = await getSession();
    return session.callTool(request.params.name, request.params.arguments ?? {});
  });

  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const session = await getSession();
    return session.listResources(request.params?.cursor);
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const session = await getSession();
    return session.readResource(request.params.uri);
  });

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    const session = await getSession();
    return session.listResourceTemplates();
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    const session = await getSession();
    return session.listPrompts();
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const session = await getSession();
    return session.getPrompt(request.params.name, request.params.arguments ?? {});
  });

  process.stderr.write(`smart-vs-mcp workspace=${workspace.workspace} endpoint=${loaded.endpoint}\n`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
