const express = require("express");
const app = express();

const errorHandler = require("./middleware/errorHandler");
const authenticateUser = require("./middleware/authMiddleware");
const taskService = require("./services/taskService");
const { initializeDatabase } = require("./database");
const supabase = require("./config/supabase");
const authRoutes = require("./auth/authRoutes");


const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
    
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/auth", authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// GET all tasks
app.get("/tasks", async (req, res, next) => {
    try {
        const result = await taskService.getAllTasks();

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// GET a specific task by ID
app.get("/tasks/:id", async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);

        const result = await taskService.getTaskById(taskId);

        if (!result) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json(result);

    } catch (error) {
        next(error);
    }
});

// Check the health of the server
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Create a new task
app.post("/tasks", async (req, res, next) => {
    try {
        const { title } = req.body;

        const result = await taskService.createTask(title);

        res.status(201).json(result);

    } catch (error) {
        next(error);
    }
});


// Update an existing task
app.put("/tasks/:id", async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        const { title, done } = req.body;

        const result = await taskService.updateTask(
            taskId,
            title,
            done
        );

        res.json(result);

    } catch (error) {
        next(error);
    }
});

// Delete a task
app.delete("/tasks/:id", async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);

        const result = await taskService.deleteTask(taskId);

        if (!result) {
            return res.status(404).json({
                error: `Task ${taskId} not found`
            });
        }

        res.status(204).send();

    } catch (error) {
        next(error);
    }
});

app.get("/public/info", (req, res) => {
    res.status(200).json({
        message: "This is a public route"
    });
});

app.get("/protected/profile", authenticateUser, (req, res) => {
    return res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at
    });
});

app.get("/protected/dashboard", authenticateUser, (req, res) => {
    return res.status(200).json({
        message: "Welcome to your protected dashboard",
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

// Centralized error handler
app.use(errorHandler);

// Start server only after database initialization
const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(port, () => {
            console.log(
                `Server is running on http://localhost:${port}`
            );
        });

    } catch (error) {
        console.error(
            "Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();