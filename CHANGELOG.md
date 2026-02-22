# Changelog

## 1.4.0 (2026-02-22)

- Upgraded search relevance with weighted ranking across title/content/category/tags/project
- Added deterministic ordering for search results (`relevance_score`, `updated_at`, `id`)
- Added normalized limits with hard caps for list/search requests
- Added `timeline_memories` MCP tool for chronological retrieval
- Added optional filters (`project`, `category`, `from`, `to`) for timeline queries
- Added offset pagination support for timeline results
- Added visibility policy model (`private`, `internal`, `shareable`) in data schema
- Enforced privacy filtering on read paths by default (private hidden unless requested)
- Added visibility filters and `include_private` controls to retrieval tools
- Added timeline and privacy test coverage
- Updated architecture, operations, README, and parity roadmap docs

## Unreleased

- Planned: redaction helper for controlled exports
- Planned: viewer module and backup/restore operations

## 1.1.0

- Re-architected MCP server into modular folders (`constants`, `handlers`, `servers`, `utils`)
- Added runtime validation helpers for tool arguments
- Added reusable tool response helpers
- Fixed search tokenization bug in DB layer (`/\\s+/`)
- Expanded docs with edition differences and contributor guide

## 1.0.0

- Initial OpenCode memory server with SQLite persistence and 6 MCP tools
