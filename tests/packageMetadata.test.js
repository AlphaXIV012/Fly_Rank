const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
const lock = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package-lock.json"), "utf8"));

describe("package.json", () => {
  test("declares better-sqlite3 as a runtime dependency with the expected range", () => {
    expect(pkg.dependencies).toHaveProperty("better-sqlite3");
    expect(pkg.dependencies["better-sqlite3"]).toBe("^13.0.3");
  });

  test("main entry point is still index.js", () => {
    expect(pkg.main).toBe("index.js");
  });
});

describe("package-lock.json", () => {
  test("top-level name/version match package.json", () => {
    expect(lock.name).toBe(pkg.name);
    expect(lock.version).toBe(pkg.version);
  });

  test("root package entry declares better-sqlite3 as a dependency", () => {
    const rootPackage = lock.packages[""];
    expect(rootPackage).toBeDefined();
    expect(rootPackage.dependencies).toHaveProperty("better-sqlite3", "^13.0.3");
  });

  test("locks better-sqlite3 with resolved tarball and integrity metadata", () => {
    const entry = lock.packages["node_modules/better-sqlite3"];
    expect(entry).toBeDefined();
    expect(entry.version).toBe("13.0.3");
    expect(entry.resolved).toBe(
      "https://registry.npmjs.org/better-sqlite3/-/better-sqlite3-13.0.3.tgz"
    );
    expect(entry.integrity).toMatch(/^sha512-/);
    expect(entry.dependencies).toEqual({ "node-addon-api": "^8.0.0" });
  });

  test("locks the node-addon-api transitive dependency required by better-sqlite3", () => {
    const entry = lock.packages["node_modules/node-addon-api"];
    expect(entry).toBeDefined();
    expect(entry.version).toBe("8.9.2");
    expect(entry.integrity).toMatch(/^sha512-/);
  });
});

describe("openAi.json removal", () => {
  test("openAi.json no longer exists in the repository", () => {
    expect(fs.existsSync(path.join(REPO_ROOT, "openAi.json"))).toBe(false);
  });
});
