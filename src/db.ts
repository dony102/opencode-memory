import initSqlJs from "sql.js";
import type { Database as SqlJsDatabase } from "sql.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import type {
  Memory,
  SaveMemoryInput,
  SearchMemoriesInput,
  ListMemoriesInput,
  TimelineMemoriesInput,
  UpdateMemoryInput,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "memories.db");
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const normalizeLimit = (limit: number | undefined): number => {
  if (limit === undefined || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }
  if (limit < 1) {
    return 1;
  }
  if (limit > MAX_LIMIT) {
    return MAX_LIMIT;
  }
  return Math.floor(limit);
};

const normalizeOffset = (offset: number | undefined): number => {
  if (offset === undefined || Number.isNaN(offset) || offset < 0) {
    return 0;
  }
  return Math.floor(offset);
};

export class MemoryDB {
  private db: SqlJsDatabase | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }

    this.db.run("PRAGMA journal_mode = WAL;");
    this.db.run("PRAGMA foreign_keys = ON;");

    this.db.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        title TEXT DEFAULT '',
        category TEXT DEFAULT 'general',
        tags TEXT DEFAULT '[]',
        project TEXT DEFAULT '',
        source TEXT DEFAULT 'manual',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    this.persist();
  }

  async ready(): Promise<void> {
    await this.initPromise;
  }

  private getDb(): SqlJsDatabase {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  private persist(): void {
    const data = this.getDb().export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }

  private queryAll(sql: string, params: (string | number)[] = []): Record<string, unknown>[] {
    const db = this.getDb();
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results: Record<string, unknown>[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as Record<string, unknown>);
    }
    stmt.free();
    return results;
  }

  private queryOne(sql: string, params: (string | number)[] = []): Record<string, unknown> | null {
    const results = this.queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  save(input: SaveMemoryInput): Memory {
    const db = this.getDb();
    const title = input.title ?? "";
    const category = input.category ?? "general";
    const tags = JSON.stringify(input.tags ?? []);
    const project = input.project ?? "";

    db.run(
      "INSERT INTO memories (content, title, category, tags, project, source) VALUES (?, ?, ?, ?, ?, 'manual')",
      [input.content, title, category, tags, project]
    );

    const row = this.queryOne("SELECT last_insert_rowid() as id");
    const id = Number(row?.id);

    const memory = this.get(id);
    if (!memory) {
      throw new Error("Failed to retrieve saved memory");
    }
    this.persist();
    return memory;
  }

  search(input: SearchMemoriesInput): Memory[] {
    const limit = normalizeLimit(input.limit);
    const rawTerms = input.query
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (rawTerms.length === 0) {
      return this.list({ limit });
    }

    const conditions: string[] = [];
    const scoreParts: string[] = [];
    const scoreParams: (string | number)[] = [];
    const whereParams: (string | number)[] = [];

    const termConditions: string[] = [];
    for (const term of rawTerms) {
      const normalizedTerm = term.toLowerCase();
      const likeTerm = "%" + normalizedTerm + "%";

      scoreParts.push(
        "(CASE WHEN LOWER(title) LIKE ? THEN 8 ELSE 0 END + " +
          "CASE WHEN LOWER(content) LIKE ? THEN 5 ELSE 0 END + " +
          "CASE WHEN LOWER(category) LIKE ? THEN 3 ELSE 0 END + " +
          "CASE WHEN LOWER(tags) LIKE ? THEN 2 ELSE 0 END + " +
          "CASE WHEN LOWER(project) LIKE ? THEN 2 ELSE 0 END)"
      );
      scoreParams.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);

      termConditions.push(
        "(LOWER(content) LIKE ? OR LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(project) LIKE ?)"
      );
      whereParams.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
    }
    conditions.push("(" + termConditions.join(" AND ") + ")");

    if (input.category) {
      conditions.push("category = ?");
      whereParams.push(input.category);
    }
    if (input.project) {
      conditions.push("project = ?");
      whereParams.push(input.project);
    }

    const whereClause = "WHERE " + conditions.join(" AND ");
    const scoreSql = scoreParts.length > 0 ? scoreParts.join(" + ") : "0";

    const sql =
      "SELECT *, (" +
      scoreSql +
      ") AS relevance_score FROM memories " +
      whereClause +
      " ORDER BY relevance_score DESC, updated_at DESC, id DESC LIMIT ?";

    const params = [...scoreParams, ...whereParams, limit];

    return this.queryAll(sql, params) as unknown as Memory[];
  }

  list(input: ListMemoriesInput): Memory[] {
    const limit = normalizeLimit(input.limit);
    const offset = normalizeOffset(input.offset);
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (input.category) {
      conditions.push("category = ?");
      params.push(input.category);
    }
    if (input.project) {
      conditions.push("project = ?");
      params.push(input.project);
    }

    params.push(limit, offset);

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const sql = "SELECT * FROM memories " + whereClause + " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    return this.queryAll(sql, params) as unknown as Memory[];
  }

  timeline(input: TimelineMemoriesInput): Memory[] {
    const limit = normalizeLimit(input.limit);
    const offset = normalizeOffset(input.offset);
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (input.category) {
      conditions.push("category = ?");
      params.push(input.category);
    }
    if (input.project) {
      conditions.push("project = ?");
      params.push(input.project);
    }
    if (input.from) {
      conditions.push("created_at >= ?");
      params.push(input.from);
    }
    if (input.to) {
      conditions.push("created_at <= ?");
      params.push(input.to);
    }

    params.push(limit, offset);

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const sql =
      "SELECT * FROM memories " +
      whereClause +
      " ORDER BY created_at ASC, id ASC LIMIT ? OFFSET ?";

    return this.queryAll(sql, params) as unknown as Memory[];
  }

  get(id: number): Memory | null {
    const row = this.queryOne("SELECT * FROM memories WHERE id = ?", [id]);
    return row as unknown as Memory | null;
  }

  delete(id: number): boolean {
    const db = this.getDb();
    const existing = this.get(id);
    if (!existing) {
      return false;
    }
    db.run("DELETE FROM memories WHERE id = ?", [id]);
    this.persist();
    return true;
  }

  update(input: UpdateMemoryInput): Memory | null {
    const existing = this.get(input.id);
    if (!existing) {
      return null;
    }

    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (input.content !== undefined) {
      fields.push("content = ?");
      params.push(input.content);
    }
    if (input.title !== undefined) {
      fields.push("title = ?");
      params.push(input.title);
    }
    if (input.category !== undefined) {
      fields.push("category = ?");
      params.push(input.category);
    }
    if (input.tags !== undefined) {
      fields.push("tags = ?");
      params.push(JSON.stringify(input.tags));
    }
    if (input.project !== undefined) {
      fields.push("project = ?");
      params.push(input.project);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push("updated_at = datetime('now')");
    params.push(input.id);

    const sql = "UPDATE memories SET " + fields.join(", ") + " WHERE id = ?";
    this.getDb().run(sql, params);
    this.persist();

    return this.get(input.id);
  }

  close(): void {
    if (this.db) {
      this.persist();
      this.db.close();
      this.db = null;
    }
  }
}
