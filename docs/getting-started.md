# Getting Started

## 1) Build the project

```bash
npm install
npm run build
```

## 2) Register the OpenCode skill

Create or update:

`~/.config/opencode/skills/opencode-mem/SKILL.md`

```md
---
name: opencode-mem
description: Persistent memory for OpenCode.
mcp:
  opencode-mem:
    type: stdio
    command: node
    args:
      - C:/Users/WINDOWS 10/.gemini/antigravity/opencode-mem/build/index.js
---
```

Restart OpenCode after saving this file.

## 3) Validate installation

Use any of these prompts in a new session:

- "Save memory that we use JWT auth in src/auth/"
- "Search memories about auth"
- "List memories for project PromptForge"

## 4) Database location

Memory data is persisted in:

`data/memories.db`
