import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MemoryDB } from "../db.js";
import { TOOL_DEFINITIONS } from "../constants/tool-definitions.js";
import { handleToolCall } from "../handlers/tool-router.js";

export const createMcpServer = (db: MemoryDB): Server => {
  const server = new Server(
    { name: "opencode-mem", version: "1.4.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    await db.ready();

    try {
      return handleToolCall(db, request.params.name, request.params.arguments);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });

  return server;
};
