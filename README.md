# Task API

A simple RESTful API built with Express.js that allows users to create, read, update, and delete tasks. The API also includes interactive documentation using Swagger UI.

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/task-api.git
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
npm run dev
```

The server will run at:

http://localhost:3000

## Example curl Output

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 15

{"status":"OK"}
```


## Features

- Create a task
- Get all tasks
- Get a task by ID
- Update a task
- Delete a task
- Swagger UI documentation

## API Documentation

Open the Swagger UI at:

http://localhost:3010/api-docs

## Swagger UI

![Swagger UI](images/swagger-ui.png)

## Technologies Used

- **Node.js** – JavaScript runtime environment
- **Express.js** – Backend framework
- **Swagger UI Express** – Interactive API documentation
- **OpenAPI 3.0** – API documentation specification
- **dotenv** – Environment variable management
- **Nodemon** – Automatically restarts the server during development
- **Git & GitHub** – Version control and project hosting