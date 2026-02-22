import type { Memory, SaveMemoryInput, SearchMemoriesInput, ListMemoriesInput, UpdateMemoryInput } from "./types.js";
export declare class MemoryDB {
    private db;
    private initPromise;
    constructor();
    private initialize;
    ready(): Promise<void>;
    private getDb;
    private persist;
    private queryAll;
    private queryOne;
    save(input: SaveMemoryInput): Memory;
    search(input: SearchMemoriesInput): Memory[];
    list(input: ListMemoriesInput): Memory[];
    get(id: number): Memory | null;
    delete(id: number): boolean;
    update(input: UpdateMemoryInput): Memory | null;
    close(): void;
}
//# sourceMappingURL=db.d.ts.map