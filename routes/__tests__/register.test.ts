import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import registerRouter from "../register";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockUserSave = vi.hoisted(() => vi.fn());
const mockSendVerificationEmail = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: Object.assign(
    vi.fn(function (this: unknown) {
      return { save: mockUserSave };
    }),
    { findOne: mockUserFindOne }
  ),
}));
vi.mock("../../functions/sendVerificationEmail", () => ({
  sendVerificationEmail: mockSendVerificationEmail,
}));

const STRONG_PASSWORD = "StrongP@ss123!";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(registerRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockUserSave.mockReset();
  mockSendVerificationEmail.mockReset();
  mockSendVerificationEmail.mockResolvedValue(undefined);
});

describe("POST /register", () => {
  it("returns validEmail: False for an invalid email", async () => {
    const res = await request(makeApp()).post("/").send({ email: "notanemail", password: STRONG_PASSWORD });
    expect(res.body).toMatchObject({ available: "False", validEmail: "False" });
  });

  it("returns weakPassword: True for a weak password", async () => {
    const res = await request(makeApp()).post("/").send({ email: "user@test.com", password: "weak" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ weakPassword: "True" });
  });

  it("returns available: False when email is already taken", async () => {
    mockUserFindOne.mockResolvedValue({ email: "user@test.com" });
    const res = await request(makeApp())
      .post("/")
      .send({ email: "user@test.com", password: STRONG_PASSWORD, name: "Alice" });
    expect(res.body).toMatchObject({ available: "False" });
  });

  it("creates user and returns available: True on success", async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockUserSave.mockResolvedValue(undefined);
    const res = await request(makeApp())
      .post("/")
      .send({ email: "new@test.com", password: STRONG_PASSWORD, name: "Alice" });
    expect(res.body).toMatchObject({ available: "True", validEmail: "True" });
    expect(mockSendVerificationEmail).toHaveBeenCalledOnce();
  });

  it("returns 500 when sending verification email fails", async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockUserSave.mockResolvedValue(undefined);
    mockSendVerificationEmail.mockRejectedValue(new Error("Resend down"));
    const res = await request(makeApp())
      .post("/")
      .send({ email: "new@test.com", password: STRONG_PASSWORD, name: "Alice" });
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ error: "Failed to send verification email." });
  });
});
