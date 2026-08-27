const Database = require("better-sqlite3");

const db = new Database("tasks.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
    )
`).run();

const count = db.prepare(
    "SELECT COUNT(*) AS count FROM tasks"
).get();

if (count.count === 0) {
    const insert = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
    `);

    insert.run("flyrank Tutorial", 1);
    insert.run("flyrank assignment", 0);
    insert.run("flyrank capstone", 0);
}

module.exports = db;