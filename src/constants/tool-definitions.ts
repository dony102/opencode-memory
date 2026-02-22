export const TOOL_DEFINITIONS = [
  {
    name: "save_memory",
    description:
      "Save a new memory, observation, or piece of knowledge for later retrieval.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The content of the memory to save" },
        title: { type: "string", description: "Optional title for the memory" },
        category: { type: "string", description: "Category for organizing. Defaults to general" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags for filtering",
        },
        project: { type: "string", description: "Project name this memory relates to" },
        visibility: {
          type: "string",
          enum: ["private", "internal", "shareable"],
          description: "Privacy level. Defaults to internal",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "search_memories",
    description: "Full-text search across all saved memories. Returns ranked results.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (supports multiple terms)" },
        category: { type: "string", description: "Filter by category" },
        project: { type: "string", description: "Filter by project" },
        visibility: {
          type: "string",
          enum: ["private", "internal", "shareable"],
          description: "Filter by visibility level",
        },
        include_private: {
          type: "boolean",
          description: "Include private memories. Defaults to false",
        },
        limit: { type: "number", description: "Max results to return (default 20)" },
      },
      required: ["query"],
    },
  },
  {
    name: "list_memories",
    description: "List recent memories with optional filtering by category or project.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Filter by category" },
        project: { type: "string", description: "Filter by project" },
        visibility: {
          type: "string",
          enum: ["private", "internal", "shareable"],
          description: "Filter by visibility level",
        },
        include_private: {
          type: "boolean",
          description: "Include private memories. Defaults to false",
        },
        limit: { type: "number", description: "Max results to return (default 20)" },
        offset: { type: "number", description: "Offset for pagination (default 0)" },
      },
    },
  },
  {
    name: "timeline_memories",
    description:
      "Return memories in chronological order with optional date range and filters.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Filter by category" },
        project: { type: "string", description: "Filter by project" },
        visibility: {
          type: "string",
          enum: ["private", "internal", "shareable"],
          description: "Filter by visibility level",
        },
        include_private: {
          type: "boolean",
          description: "Include private memories. Defaults to false",
        },
        from: {
          type: "string",
          description: "Start datetime (inclusive), format: YYYY-MM-DD HH:MM:SS",
        },
        to: {
          type: "string",
          description: "End datetime (inclusive), format: YYYY-MM-DD HH:MM:SS",
        },
        limit: { type: "number", description: "Max results to return (default 20, max 100)" },
        offset: { type: "number", description: "Offset for pagination (default 0)" },
      },
    },
  },
  {
    name: "get_memory",
    description: "Get a specific memory by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The memory ID to retrieve" },
        include_private: {
          type: "boolean",
          description: "Include private memories. Defaults to false",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_memory",
    description: "Delete a memory by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The memory ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_memory",
    description: "Update an existing memory. Only provided fields will be changed.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The memory ID to update" },
        content: { type: "string", description: "New content" },
        title: { type: "string", description: "New title" },
        category: { type: "string", description: "New category" },
        tags: { type: "array", items: { type: "string" }, description: "New tags" },
        project: { type: "string", description: "New project" },
        visibility: {
          type: "string",
          enum: ["private", "internal", "shareable"],
          description: "New visibility level",
        },
      },
      required: ["id"],
    },
  },
] as const;
