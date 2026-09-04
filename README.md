# Task API

A simple RESTful API built with **Express.js** that allows users to create, read, update, and delete tasks.

The API uses **PostgreSQL** for persistent data storage, with PostgreSQL running inside **Docker**. It also includes interactive API documentation using Swagger UI.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/AlphaXIV012/Fly_Rank
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory of the project:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/flyrank
```

> Replace the database username, password, and database name with the values configured for your PostgreSQL database.

### 4. Start PostgreSQL with Docker

Make sure **Docker Desktop** is running, then start the PostgreSQL container:

```bash
docker compose up -d
```

This starts the PostgreSQL database in the background.

To check that the container is running:

```bash
docker compose ps
```

### 5. Start the server

```bash
npm run dev
```

The server will run at:

```text
http://localhost:3000
```

The application will initialize the PostgreSQL database and create the required tables when the server starts.

## Example curl Output

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 15

{"status":"OK"}
```

## Features

* Create a task
* Get all tasks
* Get a task by ID
* Update a task
* Delete a task
* Filter tasks by completion status
* Search tasks by title
* PostgreSQL database for persistent storage
* PostgreSQL running in Docker
* Centralized error handling
* Custom application errors
* Service layer for business logic
* Repository layer for database operations
* Swagger UI documentation

## API Documentation

Open the Swagger UI at:

```text
http://localhost:3000/api-docs
```

Swagger provides an interactive interface for viewing and testing the API endpoints.

## Swagger UI

![Swagger UI](images/swagger-ui.png)

## PostgreSQL Database

The application uses PostgreSQL as its persistent database.

PostgreSQL runs inside a Docker container, allowing the database environment to be easily started and reproduced across different machines.

![PostgreSQL Database](images\Postgre_Docker.png)

## Technologies Used

* **Node.js** – JavaScript runtime environment
* **Express.js** – Backend framework
* **PostgreSQL** – Relational database for persistent data storage
* **pg** – PostgreSQL client for Node.js
* **Docker** – Containerization platform used to run PostgreSQL
* **Swagger UI Express** – Interactive API documentation
* **OpenAPI 3.0** – API documentation specification
* **dotenv** – Environment variable management
* **Nodemon** – Automatically restarts the server during development
* **Git & GitHub** – Version control and project hosting

## Project Architecture

The application follows a layered architecture:

```text
Client
  ↓
Express Routes
  ↓
Service Layer
  ↓
Repository Layer
  ↓
PostgreSQL
  ↓
Docker
```

This separation keeps the application organized and makes it easier to maintain, test, and scale.
