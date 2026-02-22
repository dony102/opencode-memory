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
- `visibility` (`private`, `internal`, `shareable`)
- `created_at`
- `updated_at`

## Tool surface

- `save_memory`
- `search_memories`
- `list_memories`
- `timeline_memories`
- `get_memory`
- `update_memory`
- `delete_memory`

## Timeline semantics (`timeline_memories`)

- Returns memories in chronological order (`created_at ASC`, then `id ASC`).
- Supports optional filters: `category`, `project`, `from`, `to`.
- `from` and `to` use inclusive boundaries.
- Uses the same normalized paging controls as list/search (`limit` capped at `100`, `offset >= 0`).

## Privacy policy semantics

- Visibility levels:
  - `private`: hidden from reads unless `include_private=true`
  - `internal`: readable by default
  - `shareable`: readable by default
- Read paths (`search_memories`, `list_memories`, `timeline_memories`, `get_memory`) exclude private records by default.
- All read tools support optional `visibility` filter and `include_private` override.

## Design choices

- `sql.js` avoids native compilation problems on Windows.
- stdio transport matches OpenCode MCP integration model.
- JSON payloads keep tool interfaces stable and explicit.

## Retrieval semantics (`search_memories`)

- Query is tokenized by whitespace and matched case-insensitively.
- All query terms must match at least one indexed field (`content`, `title`, `category`, `tags`, or `project`).
- Relevance is weighted and deterministic:
  - `title` match = 8 points
  - `content` match = 5 points
  - `category` match = 3 points
  - `tags` match = 2 points
  - `project` match = 2 points
- Results are sorted by `relevance_score DESC`, then `updated_at DESC`, then `id DESC`.
- List/search limits are normalized and capped (`1..100`) to protect runtime stability.
