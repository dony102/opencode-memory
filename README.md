# opencode-memory

Persistent memory system for OpenCode sessions — inspired by [claude-mem](https://github.com/thedotmack/claude-mem), adapted for OpenCode (OhMyOpenCode/Antigravity).

## What is this?

opencode-memory gives OpenCode persistent memory across coding sessions. Save architecture decisions, bug fixes, and learnings — then recall them in future sessions.

**Unlike claude-mem**: This is a standalone MCP server without auto-capture hooks (OpenCode doesn't support Claude Code hooks). You save memories manually, but they're searchable and persistent.

## Features

- **SQLite + Full-Text Search** — Fast local storage with FTS5
- **6 MCP Tools**: save_memory, search_memories, list_memories, get_memory, update_memory, delete_memory
- **Category & Tag Filtering** — Organize memories by project/category/tags
- **OpenCode Native** — Registered as a skill, survives config restarts

## Installation

### 1. Clone this repo

```bash
git clone https://github.com/dony102/opencode-memory.git
cd opencode-memory
npm install
npm run build
```

### 2. Install as OpenCode Skill

The skill is pre-configured in `~/.config/opencode/skills/opencode-mem/SKILL.md`. Just restart OpenCode.

### 3. Verify

After restart, test:
```
skill_mcp(mcp_name="opencode-mem", tool_name="list_memories", arguments={limit:5})
```

## Usage

### Natural Language (Recommended)

Just tell the AI naturally:
- *"Save memory that we use JWT auth in src/auth/"*
- *"Search memories about auth"*
- *"List all memories for project X"*

### Manual Tool Calls

```javascript
// Save a memory
skill_mcp(mcp_name="opencode-mem", tool_name="save_memory", arguments={
  content: "Refactored auth from session-based to JWT",
  title: "Auth refactor to JWT", 
  category: "architecture",
  tags: ["auth", "jwt"],
  project: "my-app"
})

// Search memories
skill_mcp(mcp_name="opencode-mem", tool_name="search_memories", arguments={
  query: "auth jwt"
})

// List recent memories
skill_mcp(mcp_name="opencode-mem", tool_name="list_memories", arguments={
  limit: 10
})
```

## Updating from Upstream

This repo tracks [claude-mem](https://github.com/thedotmack/claude-mem) as upstream. To pull updates:

```bash
git fetch upstream
git checkout main
git merge upstream/main
# Resolve any conflicts
git push origin main
```

## Project Structure

```
opencode-memory/
├── src/
│   ├── index.ts      # MCP server entry point
│   ├── db.ts        # SQLite + FTS5 layer
│   └── types.ts     # TypeScript interfaces
├── build/           # Compiled JS
├── data/            # SQLite database (created on first run)
├── package.json
└── tsconfig.json
```

## License

AGPL-3.0 — Same as claude-mem.
