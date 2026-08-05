const express = require("express");
const app = express();

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

let Tasks = myTasks.map((task) => ({...task}));

// GET all tasks
app.get("/tasks", (req, res) => {
    res.json(Tasks);
});

// GET a specific task by ID
app.get("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = Tasks.find((task) => task.id === taskId);
    if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }
    res.json(task);
});

// Check the health of the server
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Create a new task
app.post("/tasks", (req, res) => {
    const { title, done } = req.body;
    const newTask = { id: Tasks.length + 1, title, done };

    if(!title) {
        return res.status(400).json({ error: "Title is required" });
    }
    Tasks.push(newTask);
    res.status(201).json(newTask);
});

// Update an existing task
app.put("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, done } = req.body;
    const task = Tasks.find((t) => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }

    Object.assign(task, req.body)
    res.status(201).json(task);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = Tasks.findIndex((t) => t.id === taskId);

    if (task === -1) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }
    Tasks.splice(task, 1);
    res.status(204).json({ message: `Task ${taskId} deleted successfully` });

});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});