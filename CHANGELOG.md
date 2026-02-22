# Changelog

## 1.2.0 (in progress)

- Upgraded search relevance with weighted ranking across title/content/category/tags/project
- Added deterministic ordering for search results (`relevance_score`, `updated_at`, `id`)
- Added normalized limits with hard caps for list/search requests
- Updated architecture docs with explicit retrieval semantics

## 1.3.0 (in progress)

- Added `timeline_memories` MCP tool for chronological retrieval
- Added optional filters (`project`, `category`, `from`, `to`) for timeline queries
- Added offset pagination support for timeline results
- Documented timeline semantics in architecture and roadmap docs

## 1.1.0

- Re-architected MCP server into modular folders (`constants`, `handlers`, `servers`, `utils`)
- Added runtime validation helpers for tool arguments
- Added reusable tool response helpers
- Fixed search tokenization bug in DB layer (`/\\s+/`)
- Expanded docs with edition differences and contributor guide

## 1.0.0

- Initial OpenCode memory server with SQLite persistence and 6 MCP tools
