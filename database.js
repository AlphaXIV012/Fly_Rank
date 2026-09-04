const { Pool } = require("pg");
require("dotenv").config();

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the table if it doesn't exist
const createTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN NOT NULL DEFAULT FALSE
        )
    `);
};

// Add the initial tasks only if the table is empty
const seedTasks = async () => {
    const result = await pool.query(
        "SELECT COUNT(*) FROM tasks"
    );

    const count = parseInt(result.rows[0].count);

    if (count === 0) {
        await pool.query(`
            INSERT INTO tasks (title, done)
            VALUES
                ('flyrank Tutorial', TRUE),
                ('flyrank assignment', FALSE),
                ('flyrank capstone', FALSE)
        `);

        console.log("Initial tasks inserted");
    }
};

// Initialize the database
const initializeDatabase = async () => {
    try {
        await createTable();
        await seedTasks();

        console.log("PostgreSQL connected successfully");
    } catch (error) {
        console.error("Database initialization failed:", error.message);
        console.error(error)
        process.exit(1);
    }
};


module.exports = {
    pool,
    initializeDatabase
};