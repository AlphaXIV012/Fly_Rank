const { pool } = require("../database");


// Get all tasks
const getAllTasks = async () => {
    const result = await pool.query(
        "SELECT * FROM tasks ORDER BY id"
    );

    return result.rows;
};


// Get a task by ID
const getTaskById = async (id) => {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );

    return result.rows[0] || null;
};


// Create a new task
const createTask = async (title) => {
    const result = await pool.query(
        `
        INSERT INTO tasks (title, done)
        VALUES ($1, $2)
        RETURNING *
        `,
        [title, false]
    );

    return result.rows[0];
};


// Update a task
const updateTask = async (id, title, done) => {
    const result = await pool.query(
        `
        UPDATE tasks
        SET title = $1, done = $2
        WHERE id = $3
        RETURNING *
        `,
        [title, done, id]
    );

    return result.rows[0] || null;
};


// Delete a task
const deleteTask = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0] || null;
};


module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};