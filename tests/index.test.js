const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const request = require("supertest");

/**
 * index.js does not export the Express `app` (it only calls app.listen()
 * as a side effect of being required), so we exercise it as a real, running
 * HTTP server in a child process. This also lets us safely observe the
 * actual runtime errors introduced by this PR (see the "regression" tests
 * below) without crashing the Jest worker process itself.
 */

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const REPO_ROOT = path.join(__dirname, "..");

let serverProcess;

function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} did not start within ${timeoutMs}ms`));
        } else {
          setTimeout(attempt, 150);
        }
      });
    };
    attempt();
  });
}

beforeAll(async () => {
  serverProcess = spawn("node", ["index.js"], {
    cwd: REPO_ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore",
  });
  await waitForServer(`${BASE_URL}/health`);
}, 20000);

afterAll(() => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

describe("GET /health", () => {
  test("responds with 200 and status OK", async () => {
    const res = await request(BASE_URL).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "OK" });
  });
});

describe("GET /tasks", () => {
  test("with no query params, only returns tasks where done is false", async () => {
    // NOTE: the current implementation always computes
    // `const done = req.query.done === "true"` even when `?done` was never
    // supplied, so an unfiltered request unexpectedly narrows results down
    // to incomplete tasks only. This test documents that actual behavior.
    const res = await request(BASE_URL).get("/tasks");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((t) => t.done === false)).toBe(true);
    expect(res.body.map((t) => t.title).sort()).toEqual(
      ["flyrank assignment", "flyrank capstone"].sort()
    );
  });

  test("done=true returns only completed tasks", async () => {
    const res = await request(BASE_URL).get("/tasks").query({ done: "true" });

    expect(res.status).toBe(200);
    expect(res.body.every((t) => t.done === true)).toBe(true);
    expect(res.body.map((t) => t.title)).toContain("flyrank Tutorial");
  });

  test("done=false returns only incomplete tasks", async () => {
    const res = await request(BASE_URL).get("/tasks").query({ done: "false" });

    expect(res.status).toBe(200);
    expect(res.body.every((t) => t.done === false)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test("an invalid done value returns 404 with a descriptive error", async () => {
    const res = await request(BASE_URL).get("/tasks").query({ done: "maybe" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "done must be true or false" });
  });

  test("search filters the done-scoped results by title substring", async () => {
    const res = await request(BASE_URL)
      .get("/tasks")
      .query({ done: "true", search: "Tutorial" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("flyrank Tutorial");
  });

  test("search with no matching titles returns an empty array", async () => {
    const res = await request(BASE_URL)
      .get("/tasks")
      .query({ done: "true", search: "doesnotexist" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("search is case sensitive and matches partial titles", async () => {
    const res = await request(BASE_URL)
      .get("/tasks")
      .query({ done: "false", search: "flyrank" });

    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.title).sort()).toEqual(
      ["flyrank assignment", "flyrank capstone"].sort()
    );
  });

  test("a blank/whitespace-only search value returns 404", async () => {
    const res = await request(BASE_URL).get("/tasks").query({ search: "   " });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "search must not be empty" });
  });
});

describe("GET /tasks/:id (regression)", () => {
  test("errors out because the handler still references the undefined `Tasks` variable", async () => {
    // The in-memory list was renamed from `Tasks` to `tasks` in this PR, but
    // this handler was not updated, so any request throws a ReferenceError
    // that Express 5 converts into a 500 response.
    const res = await request(BASE_URL).get("/tasks/1");
    expect(res.status).toBe(500);
  });
});

describe("POST /tasks", () => {
  test("rejects a missing title with 400", async () => {
    const res = await request(BASE_URL).post("/tasks").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
  });

  test("rejects a blank/whitespace-only title with 400", async () => {
    const res = await request(BASE_URL).post("/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
  });

  test("rejects a null title with 400", async () => {
    const res = await request(BASE_URL).post("/tasks").send({ title: null });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
  });

  test("rejects a non-string title with 400", async () => {
    const res = await request(BASE_URL).post("/tasks").send({ title: 12345 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title must be a word character" });
  });

  test("regression: a valid title still fails because `Tasks`/`newTask` are undefined", async () => {
    // The handler builds `newtask` (lowercase) but calls `Tasks.push(newTask)`
    // (both wrong-cased identifiers), so any otherwise-valid request throws.
    const res = await request(BASE_URL).post("/tasks").send({ title: "New task" });
    expect(res.status).toBe(500);
  });
});

describe("PUT /tasks/:id", () => {
  test("returns 404 for a task id that does not exist", async () => {
    const res = await request(BASE_URL).put("/tasks/9999").send({ title: "x" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task 9999 not found" });
  });

  test("updates an existing task's title and done fields", async () => {
    const res = await request(BASE_URL)
      .put("/tasks/2")
      .send({ title: "Updated title", done: true });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 2, title: "Updated title", done: true });
  });

  test("partial update only overwrites provided fields", async () => {
    const res = await request(BASE_URL).put("/tasks/3").send({ done: true });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 3, title: "flyrank capstone", done: true });
  });
});

describe("DELETE /tasks/:id (regression)", () => {
  test("returns 404 for a task id that does not exist", async () => {
    const res = await request(BASE_URL).delete("/tasks/9999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task 9999 not found" });
  });

  test("errors out on an existing task because the handler references the undefined `Tasks` variable", async () => {
    // `findIndex` was correctly renamed to `tasks.findIndex`, but the
    // subsequent `Tasks.splice(...)` call still uses the old identifier and
    // throws before the task can actually be removed.
    const res = await request(BASE_URL).delete("/tasks/1");
    expect(res.status).toBe(500);
  });
});
