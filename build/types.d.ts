export interface Memory {
    id: number;
    content: string;
    title: string;
    category: string;
    tags: string;
    project: string;
    source: string;
    visibility: MemoryVisibility;
    created_at: string;
    updated_at: string;
}
export type MemoryVisibility = "private" | "internal" | "shareable";
export interface SaveMemoryInput {
    content: string;
    title?: string;
    category?: string;
    tags?: string[];
    project?: string;
    visibility?: MemoryVisibility;
}
export interface SearchMemoriesInput {
    query: string;
    category?: string;
    project?: string;
    visibility?: MemoryVisibility;
    include_private?: boolean;
    limit?: number;
}
export interface ListMemoriesInput {
    category?: string;
    project?: string;
    visibility?: MemoryVisibility;
    include_private?: boolean;
    limit?: number;
    offset?: number;
}
export interface TimelineMemoriesInput {
    category?: string;
    project?: string;
    visibility?: MemoryVisibility;
    include_private?: boolean;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}
export interface UpdateMemoryInput {
    id: number;
    content?: string;
    title?: string;
    category?: string;
    tags?: string[];
    project?: string;
    visibility?: MemoryVisibility;
}
export interface GetMemoryInput {
    id: number;
    include_private?: boolean;
}
export interface JsonRpcTextContent {
    type: "text";
    text: string;
}
export interface ToolResult {
    content: JsonRpcTextContent[];
    isError?: boolean;
}
export type MemoryToolName = "save_memory" | "search_memories" | "list_memories" | "timeline_memories" | "get_memory" | "delete_memory" | "update_memory";
//# sourceMappingURL=types.d.ts.map