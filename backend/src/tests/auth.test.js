const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../app");
const User = require("../models/User");
const setupTestDatabase = require("./testDb");

jest.setTimeout(30000);
setupTestDatabase();

describe("Auth API", () => {
  test("POST /api/auth/register returns 201 and creates user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      nombre: "Matiw Test",
      email: "matiw.test@example.com",
      password: "Secret123!",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe("matiw.test@example.com");
    expect(response.body.user.password).toBeUndefined();

    const savedUser = await User.findOne({ email: "matiw.test@example.com" });
    expect(savedUser).not.toBeNull();
    expect(savedUser.password).not.toBe("Secret123!");
  });

  test("POST /api/auth/login returns token with correct credentials", async () => {
    const hashedPassword = await bcrypt.hash("Secret123!", 12);

    await User.create({
      nombre: "Matiw Login",
      email: "matiw.login@example.com",
      password: hashedPassword,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "matiw.login@example.com",
      password: "Secret123!",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe("matiw.login@example.com");
    expect(response.body.user.password).toBeUndefined();
  });
});
