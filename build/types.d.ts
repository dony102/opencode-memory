export interface Memory {
    id: number;
    content: string;
    title: string;
    category: string;
    tags: string;
    project: string;
    source: string;
    created_at: string;
    updated_at: string;
}
export interface SaveMemoryInput {
    content: string;
    title?: string;
    category?: string;
    tags?: string[];
    project?: string;
}
export interface SearchMemoriesInput {
    query: string;
    category?: string;
    project?: string;
    limit?: number;
}
export interface ListMemoriesInput {
    category?: string;
    project?: string;
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
}
//# sourceMappingURL=types.d.ts.map