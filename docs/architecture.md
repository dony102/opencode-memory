# Architecture

## Core runtime components

1. OpenCode agent invokes tool calls.
2. MCP stdio server (`src/index.ts`) routes commands.
3. DB layer (`src/db.ts`) handles persistence and queries.
4. SQLite file (`data/memories.db`) stores memory records.

## Data model

Each memory record includes:

- `id`
- `content`
- `title`
- `category`
- `tags` (JSON string)
- `project`
- `source`
- `created_at`
- `updated_at`

## Tool surface

- `save_memory`
- `search_memories`
- `list_memories`
- `get_memory`
- `update_memory`
- `delete_memory`

## Design choices

- `sql.js` avoids native compilation problems on Windows.
- stdio transport matches OpenCode MCP integration model.
- JSON payloads keep tool interfaces stable and explicit.
