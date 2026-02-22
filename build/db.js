import initSqlJs from "sql.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "memories.db");
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_VISIBILITY = "internal";
const normalizeLimit = (limit) => {
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
const normalizeOffset = (offset) => {
    if (offset === undefined || Number.isNaN(offset) || offset < 0) {
        return 0;
    }
    return Math.floor(offset);
};
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
        visibility TEXT DEFAULT 'internal',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
        this.ensureVisibilityColumn();
        this.persist();
    }
    ensureVisibilityColumn() {
        const columns = this.queryAll("PRAGMA table_info(memories)");
        const hasVisibility = columns.some((column) => column.name === "visibility");
        if (!hasVisibility) {
            this.getDb().run("ALTER TABLE memories ADD COLUMN visibility TEXT DEFAULT 'internal'");
        }
        this.getDb().run("UPDATE memories SET visibility = 'internal' WHERE visibility IS NULL OR visibility = ''");
    }
    applyVisibilityFilters(conditions, params, visibility, includePrivate) {
        if (visibility) {
            conditions.push("visibility = ?");
            params.push(visibility);
        }
        if (!includePrivate) {
            conditions.push("visibility != 'private'");
        }
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
        const visibility = input.visibility ?? DEFAULT_VISIBILITY;
        db.run("INSERT INTO memories (content, title, category, tags, project, source, visibility) VALUES (?, ?, ?, ?, ?, 'manual', ?)", [input.content, title, category, tags, project, visibility]);
        const row = this.queryOne("SELECT last_insert_rowid() as id");
        const id = Number(row?.id);
        const memory = this.get(id, true);
        if (!memory) {
            throw new Error("Failed to retrieve saved memory");
        }
        this.persist();
        return memory;
    }
    search(input) {
        const limit = normalizeLimit(input.limit);
        const rawTerms = input.query
            .split(/\s+/)
            .filter((t) => t.length > 0);
        if (rawTerms.length === 0) {
            return this.list({
                category: input.category,
                project: input.project,
                visibility: input.visibility,
                include_private: input.include_private,
                limit,
                offset: 0,
            });
        }
        const conditions = [];
        const scoreParts = [];
        const scoreParams = [];
        const whereParams = [];
        const termConditions = [];
        for (const term of rawTerms) {
            const normalizedTerm = term.toLowerCase();
            const likeTerm = "%" + normalizedTerm + "%";
            scoreParts.push("(CASE WHEN LOWER(title) LIKE ? THEN 8 ELSE 0 END + " +
                "CASE WHEN LOWER(content) LIKE ? THEN 5 ELSE 0 END + " +
                "CASE WHEN LOWER(category) LIKE ? THEN 3 ELSE 0 END + " +
                "CASE WHEN LOWER(tags) LIKE ? THEN 2 ELSE 0 END + " +
                "CASE WHEN LOWER(project) LIKE ? THEN 2 ELSE 0 END)");
            scoreParams.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
            termConditions.push("(LOWER(content) LIKE ? OR LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(project) LIKE ?)");
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
        this.applyVisibilityFilters(conditions, whereParams, input.visibility, input.include_private);
        const whereClause = "WHERE " + conditions.join(" AND ");
        const scoreSql = scoreParts.length > 0 ? scoreParts.join(" + ") : "0";
        const sql = "SELECT *, (" +
            scoreSql +
            ") AS relevance_score FROM memories " +
            whereClause +
            " ORDER BY relevance_score DESC, updated_at DESC, id DESC LIMIT ?";
        const params = [...scoreParams, ...whereParams, limit];
        return this.queryAll(sql, params);
    }
    list(input) {
        const limit = normalizeLimit(input.limit);
        const offset = normalizeOffset(input.offset);
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
        this.applyVisibilityFilters(conditions, params, input.visibility, input.include_private);
        params.push(limit, offset);
        const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
        const sql = "SELECT * FROM memories " + whereClause + " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return this.queryAll(sql, params);
    }
    timeline(input) {
        const limit = normalizeLimit(input.limit);
        const offset = normalizeOffset(input.offset);
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
        if (input.from) {
            conditions.push("created_at >= ?");
            params.push(input.from);
        }
        if (input.to) {
            conditions.push("created_at <= ?");
            params.push(input.to);
        }
        this.applyVisibilityFilters(conditions, params, input.visibility, input.include_private);
        params.push(limit, offset);
        const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
        const sql = "SELECT * FROM memories " +
            whereClause +
            " ORDER BY created_at ASC, id ASC LIMIT ? OFFSET ?";
        return this.queryAll(sql, params);
    }
    get(id, includePrivate = false) {
        const sql = includePrivate
            ? "SELECT * FROM memories WHERE id = ?"
            : "SELECT * FROM memories WHERE id = ? AND visibility != 'private'";
        const row = this.queryOne(sql, [id]);
        return row;
    }
    delete(id) {
        const db = this.getDb();
        const existing = this.get(id, true);
        if (!existing) {
            return false;
        }
        db.run("DELETE FROM memories WHERE id = ?", [id]);
        this.persist();
        return true;
    }
    update(input) {
        const existing = this.get(input.id, true);
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
        if (input.visibility !== undefined) {
            fields.push("visibility = ?");
            params.push(input.visibility);
        }
        if (fields.length === 0) {
            return existing;
        }
        fields.push("updated_at = datetime('now')");
        params.push(input.id);
        const sql = "UPDATE memories SET " + fields.join(", ") + " WHERE id = ?";
        this.getDb().run(sql, params);
        this.persist();
        return this.get(input.id, true);
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