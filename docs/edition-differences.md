# Edition Differences: Original vs OpenCode Modified

This repository is intentionally not a direct mirror of `thedotmack/claude-mem`.

## What is preserved

- Long-term memory objective across coding sessions
- MCP-first interaction model
- Structured memory entities (title/content/category/tags/project)
- Update pipeline from upstream references

## What is modified for OpenCode

- Claude hook lifecycle is replaced with OpenCode skill-based invocation
- Memory capture is explicit (manual saves), not Claude hook auto-capture
- Runtime architecture is simplified to stdio MCP + `sql.js`
- Codebase layout is modularized for maintainability in this repo

## Why this matters

OpenCode and Claude Code have different extension/runtime surfaces. A byte-for-byte clone would look complete but fail operationally. This project favors compatibility and maintainable adaptation over raw duplication.
