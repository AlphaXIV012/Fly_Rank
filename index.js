const express = require("express");
const app = express();

const db = require("./database");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
    
require("dotenv").config();
const port = process.env.PORT || 3010;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const myTasks = [
  {id: 1, title: "flyrank Tutorial", done: true, },
  {id: 2, title: "flyrank assignment", done: false, },
  {id: 3, title: "flyrank capstone", done: false, }
];  

let tasks = myTasks.map((task) => ({...task}));

// GET all tasks
app.get("/tasks", (req, res) => {
    const tasks = db
        .prepare("SELECT * FROM tasks")
        .all();

    res.json(tasks);
});

// GET a specific task by ID
app.get("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(taskId);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json(task);
});

// Check the health of the server
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Create a new task
app.post("/tasks", (req, res) => {
    const { title } = req.body;

    if(title === undefined || title === null || String(title).trim() === "") {
        return res.status(400).json({ error: "Title is required" });
    }
    if (typeof title !== "string") {
        return res.status(400).json({
            error: "Title must be a word character",
        });
    }

    // const result = db.prepare(`
    //     INSERT INTO tasks (title, done)
    //     VALUES (?, ?)
    // `).run(title.trim(), 0);

    const insert = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
    `)

    const result = insert.run(title.trim(), 0);

    const newTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(result.lastInsertRowid);

    // Return the newly created task
    res.status(201).json(newTask);

});


// Update an existing task
app.put("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, done } = req.body;

    if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
        error: "Title is required"
    });
}

if (typeof done !== "boolean") {
    return res.status(400).json({
        error: "Done must be true or false"
    });
}

    const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(taskId);

    if (!task) {
    return res.status(404).json({
        error: `Task ${taskId} not found`
    });
}

    const update = db.prepare(`
    UPDATE tasks
    SET title = ?, done = ?
    WHERE id = ?
`);

    const result = update.run(title.trim(), done?1:0, taskId);

    if (result.changes === 0) {
        return res.status(404).json({
            error: `Task ${taskId} not found`
        });
    }

    const updatedTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(taskId);

    res.json(updatedTask);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(taskId);

    if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }

    const remove = db.prepare("DELETE FROM tasks WHERE id = ?")
    remove.run(taskId);
    res.status(204).json({ message: `Task ${taskId} deleted successfully` });

});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});