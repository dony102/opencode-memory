# Feature Parity Matrix

This matrix tracks how `opencode-memory` aligns with the original `claude-mem` goals while staying OpenCode-native.

Status legend:

- `Done` = implemented and usable now
- `Modified` = available but adapted to OpenCode runtime model
- `Planned` = roadmap item, not implemented yet
- `Not Applicable` = tied to Claude-specific platform behavior

## Core Parity

| Capability (Original Intent) | claude-mem (Claude Code) | opencode-memory (OpenCode) | Status | Notes |
| --- | --- | --- | --- | --- |
| Persistent memory across sessions | Yes | Yes | Done | Stored in SQLite file (`data/memories.db`). |
| MCP-accessible memory tools | Yes | Yes | Done | 6 tools: save/search/list/get/update/delete. |
| Full-text search | Yes (hybrid/vector) | Yes (SQLite text search) | Modified | Uses sql.js + LIKE terms today. |
| Structured metadata (title/category/tags/project) | Yes | Yes | Done | Full CRUD support in tool layer. |
| Web viewer dashboard | Yes | No | Planned | Can be added as separate UI module. |
| Auto-capture via lifecycle hooks | Yes | No | Not Applicable | Claude hooks do not exist in OpenCode runtime. |
| Memory compression with Claude SDK | Yes | No | Planned | Replace with optional local summarization pipeline. |
| Progressive disclosure workflow | Yes | Partial | Modified | Tool split exists; ranking/cost layers still basic. |
| Privacy block controls | Yes (`<private>`) | Partial | Planned | Could be added in save pipeline filters. |
| Timeline exploration tooling | Yes | Partial | Planned | Can be added with dedicated timeline query tool. |

## Engineering Parity

| Engineering Area | Current State | Status | Next Step |
| --- | --- | --- | --- |
| Server architecture | Modularized (`constants/`, `handlers/`, `servers/`, `utils/`) | Done | Keep boundary clean and testable. |
| Input safety | Runtime validators for tool arguments | Done | Add schema-driven test vectors. |
| DB reliability | Write-through persistence after mutations | Done | Add backup/restore utility script. |
| Update pipeline | Local scripts + GitHub auto-update workflow | Modified | Enable workflow token scope and conflict policy. |
| Documentation quality | Premium README + diagrams + ops docs | Done | Add API reference page per tool. |

## OpenCode-Specific Advantages

| Advantage | Why It Matters |
| --- | --- |
| `sql.js` runtime | Avoids native dependency failures on Windows environments. |
| Skill-based registration | Stable integration path across OpenCode restarts. |
| Lean MCP scope | Faster maintenance and easier feature iteration. |

## Roadmap (Modified-Full Edition)

1. Add `timeline_memories` tool for chronological retrieval.
2. Add optional summarization task to condense related memories.
3. Add privacy policy tags (`private`, `internal`, `shareable`) with filter enforcement.
4. Add lightweight web viewer (read-only) for memory browsing.
5. Add test suite for handlers and DB query behavior.
