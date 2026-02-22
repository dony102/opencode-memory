import initSqlJs from "sql.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "memories.db");
export class MemoryDB {
    db = null;
    initPromise;
    constructor() {
        this.initPromise = this.initialize();
    }
    async initialize() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const SQL = await initSqlJs();
        if (fs.existsSync(DB_PATH)) {
            const fileBuffer = fs.readFileSync(DB_PATH);
            this.db = new SQL.Database(fileBuffer);
        }
        else {
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
    async ready() {
        await this.initPromise;
    }
    getDb() {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        return this.db;
    }
    persist() {
        const data = this.getDb().export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
    queryAll(sql, params = []) {
        const db = this.getDb();
        const stmt = db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    queryOne(sql, params = []) {
        const results = this.queryAll(sql, params);
        return results.length > 0 ? results[0] : null;
    }
    save(input) {
        const db = this.getDb();
        const title = input.title ?? "";
        const category = input.category ?? "general";
        const tags = JSON.stringify(input.tags ?? []);
        const project = input.project ?? "";
        db.run("INSERT INTO memories (content, title, category, tags, project, source) VALUES (?, ?, ?, ?, ?, 'manual')", [input.content, title, category, tags, project]);
        const row = this.queryOne("SELECT last_insert_rowid() as id");
        const id = Number(row?.id);
        const memory = this.get(id);
        if (!memory) {
            throw new Error("Failed to retrieve saved memory");
        }
        this.persist();
        return memory;
    }
    search(input) {
        const limit = input.limit ?? 20;
        const rawTerms = input.query
            .split(/\s+/)
            .filter((t) => t.length > 0);
        if (rawTerms.length === 0) {
            return this.list({ limit });
        }
        const conditions = [];
        const params = [];
        const termConditions = [];
        for (const term of rawTerms) {
            const likeTerm = "%" + term + "%";
            termConditions.push("(content LIKE ? OR title LIKE ? OR category LIKE ? OR tags LIKE ?)");
            params.push(likeTerm, likeTerm, likeTerm, likeTerm);
        }
        conditions.push("(" + termConditions.join(" AND ") + ")");
        if (input.category) {
            conditions.push("category = ?");
            params.push(input.category);
        }
        if (input.project) {
            conditions.push("project = ?");
            params.push(input.project);
        }
        params.push(limit);
        const whereClause = "WHERE " + conditions.join(" AND ");
        const sql = "SELECT * FROM memories " + whereClause + " ORDER BY updated_at DESC LIMIT ?";
        return this.queryAll(sql, params);
    }
    list(input) {
        const limit = input.limit ?? 20;
        const offset = input.offset ?? 0;
        const conditions = [];
        const params = [];
        if (input.category) {
            conditions.push("category = ?");
            params.push(input.category);
        }
        if (input.project) {
            conditions.push("project = ?");
            params.push(input.project);
        }
        params.push(limit, offset);
        const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
        const sql = "SELECT * FROM memories " + whereClause + " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return this.queryAll(sql, params);
    }
    get(id) {
        const row = this.queryOne("SELECT * FROM memories WHERE id = ?", [id]);
        return row;
    }
    delete(id) {
        const db = this.getDb();
        const existing = this.get(id);
        if (!existing) {
            return false;
        }
        db.run("DELETE FROM memories WHERE id = ?", [id]);
        this.persist();
        return true;
    }
    update(input) {
        const existing = this.get(input.id);
        if (!existing) {
            return null;
        }
        const fields = [];
        const params = [];
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
    close() {
        if (this.db) {
            this.persist();
            this.db.close();
            this.db = null;
        }
    }
}
//# sourceMappingURL=db.js.map