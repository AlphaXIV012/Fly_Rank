const express = require("express");
const app = express();
const port = process.env.PORT || 3010;

app.use(express.json());

const myTasks = [
  {id: 1, title: "flyrank Tutorial", status: true, },
  {id: 2, title: "flyrank assignment", status: false, },
  {id: 3, title: "flyrank capstone", status: false, }
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
        return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
});

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});