const fs = require("fs");
const os = require("os");
const path = require("path");
const Database = require("better-sqlite3");

/**
 * database.js opens/creates "tasks.db" relative to process.cwd() and, as a
 * side effect of being required, creates the `tasks` table and seeds it with
 * three default rows when the table is empty. To test this in isolation
 * (without touching the real tasks.db committed to the repo) we run each
 * test from a temporary working directory and reload the module fresh.
 */
describe("database.js", () => {
  let tmpDir;
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tasks-db-test-"));
    process.chdir(tmpDir);
    jest.resetModules();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("creates a tasks.db file in the current working directory", () => {
    const db = require("../database");
    expect(fs.existsSync(path.join(tmpDir, "tasks.db"))).toBe(true);
    db.close();
  });

  test("creates a tasks table with the expected schema", () => {
    const db = require("../database");
    const columns = db.prepare("PRAGMA table_info(tasks)").all();
    const byName = Object.fromEntries(columns.map((c) => [c.name, c]));

    expect(Object.keys(byName)).toEqual(["id", "title", "done"]);
    expect(byName.id.pk).toBe(1);
    expect(byName.title.notnull).toBe(1);
    expect(byName.done.notnull).toBe(1);
    expect(byName.done.dflt_value).toBe("0");

    db.close();
  });

  test("is idempotent: requiring / running CREATE TABLE again does not error", () => {
    const db = require("../database");
    expect(() => {
      db.prepare(`
          CREATE TABLE IF NOT EXISTS tasks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              done INTEGER NOT NULL DEFAULT 0
          )
      `).run();
    }).not.toThrow();
    db.close();
  });

  test("seeds three default tasks when the table is empty", () => {
    const db = require("../database");
    const rows = db.prepare("SELECT id, title, done FROM tasks ORDER BY id").all();

    expect(rows).toEqual([
      { id: 1, title: "flyrank Tutorial", done: 1 },
      { id: 2, title: "flyrank assignment", done: 0 },
      { id: 3, title: "flyrank capstone", done: 0 },
    ]);

    db.close();
  });

  test("does not reseed data when the table already has rows", () => {
    // Pre-populate tasks.db with a single custom row before database.js runs.
    const preDb = new Database(path.join(tmpDir, "tasks.db"));
    preDb
      .prepare(
        `CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0
        )`
      )
      .run();
    preDb.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run("Pre-existing task", 0);
    preDb.close();

    const db = require("../database");
    const rows = db.prepare("SELECT * FROM tasks").all();

    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Pre-existing task");

    db.close();
  });

  test("enforces NOT NULL constraint on the title column", () => {
    const db = require("../database");
    expect(() => {
      db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(null, 0);
    }).toThrow(/NOT NULL constraint failed/);
    db.close();
  });

  test("done column defaults to 0 when omitted on insert", () => {
    const db = require("../database");
    db.prepare("INSERT INTO tasks (title) VALUES (?)").run("Default done task");
    const row = db.prepare("SELECT * FROM tasks WHERE title = ?").get("Default done task");
    expect(row.done).toBe(0);
    db.close();
  });

  test("id column auto-increments across inserts", () => {
    const db = require("../database");
    const before = db.prepare("SELECT MAX(id) AS maxId FROM tasks").get().maxId;
    const info = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run("Another task", 1);
    expect(info.lastInsertRowid).toBe(before + 1);
    db.close();
  });

  test("exports a usable better-sqlite3 database instance", () => {
    const db = require("../database");
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe("function");
    expect(typeof db.close).toBe("function");
    db.close();
  });
});
