import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MemoryDB } from "./db.js";
import { createMcpServer } from "./servers/mcp-server.js";
const db = new MemoryDB();
const server = createMcpServer(db);
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