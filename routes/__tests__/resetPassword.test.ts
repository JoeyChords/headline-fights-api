import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import resetPasswordRouter from "../resetPassword";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOne: mockUserFindOne, findOneAndUpdate: mockUserFindOneAndUpdate },
}));

const RECENT_DATETIME = new Date(Date.now() - 5 * 60 * 1000);
const VALID_TOKEN = "valid-token-abc";
const STRONG_PASSWORD = "StrongP@ss123!";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(resetPasswordRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockUserFindOneAndUpdate.mockReset();
  mockUserFindOneAndUpdate.mockResolvedValue({});
});

describe("POST /resetPassword", () => {
  it("returns user_exists: false when user not found", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const res = await request(makeApp()).post("/").send({ email: "nobody@test.com" });
    expect(res.body).toEqual({ user_exists: false });
  });

  it("returns submitted_in_time: false when token is expired", async () => {
    mockUserFindOne.mockResolvedValue({
      email: "alice@test.com",
      password_reset_token: VALID_TOKEN,
      password_reset_datetime: new Date(Date.now() - 20 * 60 * 1000),
    });
    const res = await request(makeApp())
      .post("/")
      .send({ email: "alice@test.com", token: VALID_TOKEN, password: STRONG_PASSWORD });
    expect(res.body).toMatchObject({ submitted_in_time: false, user_exists: true });
  });

  it("returns submitted_in_time: false when token is wrong", async () => {
    mockUserFindOne.mockResolvedValue({
      email: "alice@test.com",
      password_reset_token: VALID_TOKEN,
      password_reset_datetime: RECENT_DATETIME,
    });
    const res = await request(makeApp())
      .post("/")
      .send({ email: "alice@test.com", token: "wrong-token", password: STRONG_PASSWORD });
    expect(res.body).toMatchObject({ submitted_in_time: false, user_exists: true });
  });

  it("returns 400 with weak_password: true when password is weak", async () => {
    mockUserFindOne.mockResolvedValue({
      email: "alice@test.com",
      password_reset_token: VALID_TOKEN,
      password_reset_datetime: RECENT_DATETIME,
    });
    const res = await request(makeApp())
      .post("/")
      .send({ email: "alice@test.com", token: VALID_TOKEN, password: "weak" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ weak_password: true });
  });

  it("updates password and returns success when valid", async () => {
    mockUserFindOne.mockResolvedValue({
      email: "alice@test.com",
      password_reset_token: VALID_TOKEN,
      password_reset_datetime: RECENT_DATETIME,
    });
    const res = await request(makeApp())
      .post("/")
      .send({ email: "alice@test.com", token: VALID_TOKEN, password: STRONG_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ submitted_in_time: true, user_exists: true });
    expect(mockUserFindOneAndUpdate).toHaveBeenCalledOnce();
  });
});
