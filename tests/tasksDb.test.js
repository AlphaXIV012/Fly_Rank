const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

/**
 * tasks.db is the sqlite database file committed alongside database.js in
 * this PR. We open it read-only so the committed fixture is never mutated
 * by the test suite.
 */
describe("tasks.db (committed snapshot)", () => {
  const dbPath = path.join(__dirname, "..", "tasks.db");
  let db;

  beforeAll(() => {
    expect(fs.existsSync(dbPath)).toBe(true);
    db = new Database(dbPath, { readonly: true });
  });

  afterAll(() => {
    if (db) {
      db.close();
    }
  });

  test("starts with the SQLite file format magic header", () => {
    const header = Buffer.alloc(16);
    const fd = fs.openSync(dbPath, "r");
    fs.readSync(fd, header, 0, 16, 0);
    fs.closeSync(fd);
    expect(header.toString("utf8")).toBe("SQLite format 3\0");
  });

  test("contains a tasks table matching the schema created by database.js", () => {
    const columns = db.prepare("PRAGMA table_info(tasks)").all();
    const byName = Object.fromEntries(columns.map((c) => [c.name, c]));

    expect(Object.keys(byName)).toEqual(["id", "title", "done"]);
    expect(byName.id.pk).toBe(1);
    expect(byName.title.notnull).toBe(1);
    expect(byName.done.notnull).toBe(1);
  });

  test("contains exactly the three seeded tasks in the expected order", () => {
    const rows = db.prepare("SELECT id, title, done FROM tasks ORDER BY id").all();

    expect(rows).toEqual([
      { id: 1, title: "flyrank Tutorial", done: 1 },
      { id: 2, title: "flyrank assignment", done: 0 },
      { id: 3, title: "flyrank capstone", done: 0 },
    ]);
  });
});
