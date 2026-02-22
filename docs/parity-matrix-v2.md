# Feature Parity Matrix v2 (Release-Driven)

This document converts parity goals into measurable release milestones.

## Scope

- Baseline source: `thedotmack/claude-mem` capability model
- Target runtime: OpenCode skill + MCP stdio architecture
- Strategy: functional parity where runtime-compatible, explicit adaptation where platform differs

## Status Legend

- `Completed`: shipped in current branch
- `In Progress`: partial implementation exists
- `Planned`: defined and approved, not started
- `Not Applicable`: Claude-only behavior that cannot map to OpenCode hooks

## Module Checklist

| Module | Objective | Current | Acceptance Criteria |
| --- | --- | --- | --- |
| Core MCP server | Stable tool interface and dispatch | Completed | 6 tools callable; JSON responses; startup/shutdown clean |
| Storage engine | Durable memory persistence | Completed | `data/memories.db` survives restart; CRUD verified |
| Query layer | Practical retrieval quality | In Progress | Weighted ranking + deterministic ordering + normalized limits |
| Timeline retrieval | Chronological context reconstruction | In Progress | `timeline_memories` tool added with filters and offset paging |
| Compression/Summary | Reduce noise from long memory sets | Planned | Summarization pipeline generates compact session briefs |
| Privacy controls | Respect sensitive memory boundaries | Planned | Tag-based filter (`private/internal/shareable`) enforced in read paths |
| Read-only viewer UI | Human-friendly history exploration | Planned | Lightweight docs UI can browse/filter memories |
| Automation sync | Upstream-aware maintenance | In Progress | Scheduled update works with conflict strategy and reporting |
| Testing harness | Regression protection | Planned | Unit tests for validators/router/DB + smoke test in CI |
| Ops tooling | Backup/recovery and diagnostics | Planned | Backup script + restore command + health diagnostics |

## Release Milestones

## v1.2.0 (Retrieval Quality)

**Theme:** Better memory recall quality without changing runtime model.

- [x] Replace current term splitting + LIKE strategy with weighted matching helper
- [x] Add query normalization (case handling)
- [x] Add `limit` defaults + hard caps in all list/search paths
- [ ] Add retrieval test fixtures for ranking behavior
- [x] Document retrieval semantics in `docs/architecture.md`

**Definition of Done:**
- Search returns deterministic order for the same input
- Build passes and MCP smoke test passes
- Retrieval docs updated with examples

## v1.3.0 (Context Timeline)

**Theme:** Session chronology and change narrative.

- [x] Add `timeline_memories` MCP tool
- [x] Support filters by project/category/date range
- [x] Add pagination contract (`cursor` or `offset`)
- [ ] Add timeline examples in docs and README

**Definition of Done:**
- Tool appears in `ListTools` with schema
- Timeline returns stable ordering and pagination
- No TypeScript diagnostics in new handler paths

## v1.4.0 (Privacy + Policy)

**Theme:** Memory governance for team usage.

- [ ] Add policy tags (`private`, `internal`, `shareable`)
- [ ] Enforce policy filtering in all retrieval endpoints
- [ ] Add optional redaction helper for exports
- [ ] Document governance model in operations guide

**Definition of Done:**
- Policy tags persisted and respected at read time
- Explicit tests for policy bypass edge-cases

## v1.5.0 (Viewer + DX)

**Theme:** Visual discoverability and operational ergonomics.

- [ ] Add read-only viewer module (local static UI)
- [ ] Add backup/restore scripts
- [ ] Add release checklist template
- [ ] Add troubleshooting matrix to `docs/operations.md`

**Definition of Done:**
- Viewer lists and filters memory records
- Backup/restore scripts documented and validated

## Gap Register (Original vs Modified)

| Original Capability | OpenCode Constraint | Modified Direction |
| --- | --- | --- |
| Hook-based auto-capture | No Claude lifecycle hooks in OpenCode | Prompt/tool-driven capture, optional future watcher service |
| Claude SDK compression | Different SDK/runtime assumptions | Local summarization task with pluggable providers |
| Embedded web viewer in plugin flow | Different plugin surface | Standalone lightweight viewer |

## Execution Notes

- Prefer backward-compatible tool schemas when adding capabilities.
- Keep `src/handlers` and `src/utils` boundaries strict to reduce regression risk.
- Every milestone must include docs updates and one smoke verification command.
