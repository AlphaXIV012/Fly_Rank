const taskRepository = require("../repositories/taskRepository");
const {
    BadRequestError,
    NotFoundError
} = require("../errors/appError");

// Get all tasks
const getAllTasks = async () => {
    return await taskRepository.getAllTasks();
};


// Get a task by ID
const getTaskById = async (id) => {

    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid task ID");
    }

    const task = await taskRepository.getTaskById(id);

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    return task;
};


// Create a task
const createTask = async (title) => {

    if (typeof title !== "string" || !title.trim()) {
        throw new BadRequestError("Title is required");
    }

    const cleanTitle = title.trim();

    return await taskRepository.createTask(cleanTitle);
};


// Update a task
const updateTask = async (id, title, done) => {

    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid task ID");
    }

    if (typeof title !== "string" || !title.trim()) {
        throw new BadRequestError("Title is required");
    }

    if (typeof done !== "boolean") {
        throw new BadRequestError(
            "Done must be true or false"
        );
    }

    const task = await taskRepository.updateTask(
        id,
        title.trim(),
        done
    );

    if (!task) {
        throw new NotFoundError(
            `Task ${id} not found`
        );
    }

    return task;
};


// Delete a task
const deleteTask = async (id) => {

    if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("Invalid task ID");
    }

    const task = await taskRepository.deleteTask(id);

    if (!task) {
        throw new NotFoundError(
            `Task ${id} not found`
        );
    }

    return task;
};


module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};