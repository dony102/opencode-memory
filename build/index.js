import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { MemoryDB } from "./db.js";
const db = new MemoryDB();
const server = new Server({ name: "opencode-mem", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "save_memory",
            description: "Save a new memory, observation, or piece of knowledge for later retrieval.",
            inputSchema: {
                type: "object",
                properties: {
                    content: { type: "string", description: "The content of the memory to save" },
                    title: { type: "string", description: "Optional title for the memory" },
                    category: { type: "string", description: "Category for organizing. Defaults to general" },
                    tags: { type: "array", items: { type: "string" }, description: "Optional tags for filtering" },
                    project: { type: "string", description: "Project name this memory relates to" },
                },
                required: ["content"],
            },
        },
        {
            name: "search_memories",
            description: "Full-text search across all saved memories. Returns ranked results.",
            inputSchema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Search query (supports multiple terms)" },
                    category: { type: "string", description: "Filter by category" },
                    project: { type: "string", description: "Filter by project" },
                    limit: { type: "number", description: "Max results to return (default 20)" },
                },
                required: ["query"],
            },
        },
        {
            name: "list_memories",
            description: "List recent memories with optional filtering by category or project.",
            inputSchema: {
                type: "object",
                properties: {
                    category: { type: "string", description: "Filter by category" },
                    project: { type: "string", description: "Filter by project" },
                    limit: { type: "number", description: "Max results to return (default 20)" },
                    offset: { type: "number", description: "Offset for pagination (default 0)" },
                },
            },
        },
        {
            name: "get_memory",
            description: "Get a specific memory by its ID.",
            inputSchema: {
                type: "object",
                properties: {
                    id: { type: "number", description: "The memory ID to retrieve" },
                },
                required: ["id"],
            },
        },
        {
            name: "delete_memory",
            description: "Delete a memory by its ID.",
            inputSchema: {
                type: "object",
                properties: {
                    id: { type: "number", description: "The memory ID to delete" },
                },
                required: ["id"],
            },
        },
        {
            name: "update_memory",
            description: "Update an existing memory. Only provided fields will be changed.",
            inputSchema: {
                type: "object",
                properties: {
                    id: { type: "number", description: "The memory ID to update" },
                    content: { type: "string", description: "New content" },
                    title: { type: "string", description: "New title" },
                    category: { type: "string", description: "New category" },
                    tags: { type: "array", items: { type: "string" }, description: "New tags" },
                    project: { type: "string", description: "New project" },
                },
                required: ["id"],
            },
        },
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    await db.ready();
    const { name, arguments: args } = request.params;
    switch (name) {
        case "save_memory": {
            const input = args;
            const memory = db.save(input);
            return {
                content: [{ type: "text", text: JSON.stringify(memory, null, 2) }],
            };
        }
        case "search_memories": {
            const input = args;
            const results = db.search(input);
            return {
                content: [{ type: "text", text: JSON.stringify({ count: results.length, memories: results }, null, 2) }],
            };
        }
        case "list_memories": {
            const input = args;
            const results = db.list(input);
            return {
                content: [{ type: "text", text: JSON.stringify({ count: results.length, memories: results }, null, 2) }],
            };
        }
        case "get_memory": {
            const input = args;
            const memory = db.get(input.id);
            if (!memory) {
                return {
                    content: [{ type: "text", text: JSON.stringify({ error: "Memory with id " + input.id + " not found" }) }],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: JSON.stringify(memory, null, 2) }],
            };
        }
        case "delete_memory": {
            const input = args;
            const deleted = db.delete(input.id);
            if (!deleted) {
                return {
                    content: [{ type: "text", text: JSON.stringify({ error: "Memory with id " + input.id + " not found" }) }],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: JSON.stringify({ success: true, message: "Memory " + input.id + " deleted" }) }],
            };
        }
        case "update_memory": {
            const input = args;
            const memory = db.update(input);
            if (!memory) {
                return {
                    content: [{ type: "text", text: JSON.stringify({ error: "Memory with id " + input.id + " not found" }) }],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: JSON.stringify(memory, null, 2) }],
            };
        }
        default:
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "Unknown tool: " + name }) }],
                isError: true,
            };
    }
});
async function main() {
    await db.ready();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
process.on("SIGINT", () => {
    db.close();
    process.exit(0);
});
process.on("SIGTERM", () => {
    db.close();
    process.exit(0);
});
main().catch((error) => {
    console.error("Fatal error:", error);
    db.close();
    process.exit(1);
});
//# sourceMappingURL=index.js.map