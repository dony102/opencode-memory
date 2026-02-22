import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MemoryDB } from "./db.js";
import { createMcpServer } from "./servers/mcp-server.js";

const db = new MemoryDB();
const server = createMcpServer(db);

async function main(): Promise<void> {
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

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  db.close();
  process.exit(1);
});
