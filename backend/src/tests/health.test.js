const request = require("supertest");
const app = require("../app");

describe("Health API", () => {
  test("GET /api/health returns ok status and timestamp", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(typeof response.body.timestamp).toBe("string");
  });
});
