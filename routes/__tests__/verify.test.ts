import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";
import verifyRouter from "../verify";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOne: mockUserFindOne, findOneAndUpdate: mockUserFindOneAndUpdate },
}));

const RECENT_DATETIME = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "test", resave: false, saveUninitialized: true }));
  app.use(verifyRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockUserFindOneAndUpdate.mockReset();
  mockUserFindOneAndUpdate.mockResolvedValue({});
});

describe("POST /verify", () => {
  it("returns submitted_in_time: false when user is not found", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const res = await request(makeApp()).post("/").send({ email: "x@test.com", code: "123456" });
    expect(res.body).toEqual({ submitted_in_time: false });
  });

  it("returns submitted_in_time: false when code is expired", async () => {
    mockUserFindOne.mockResolvedValue({
      _id: "uid",
      name: "Alice",
      email: "alice@test.com",
      verification_code: 111111,
      verification_code_datetime: new Date(Date.now() - 20 * 60 * 1000),
    });
    const res = await request(makeApp()).post("/").send({ email: "alice@test.com", code: "111111" });
    expect(res.body).toEqual({ submitted_in_time: false });
  });

  it("returns email_verified: false when code is wrong", async () => {
    mockUserFindOne.mockResolvedValue({
      _id: "uid",
      name: "Alice",
      email: "alice@test.com",
      verification_code: 111111,
      verification_code_datetime: RECENT_DATETIME,
    });
    const res = await request(makeApp()).post("/").send({ email: "alice@test.com", code: "999999" });
    expect(res.body).toMatchObject({ submitted_in_time: true, email_verified: false });
  });

  it("returns email_verified: true and name when code is correct and fresh", async () => {
    mockUserFindOne.mockResolvedValue({
      _id: "uid",
      name: "Alice",
      email: "alice@test.com",
      verification_code: 123456,
      verification_code_datetime: RECENT_DATETIME,
    });
    const res = await request(makeApp()).post("/").send({ email: "alice@test.com", code: "123456" });
    expect(res.body).toMatchObject({ submitted_in_time: true, email_verified: true, name: "Alice" });
    expect(mockUserFindOneAndUpdate).toHaveBeenCalledWith({ email: "alice@test.com" }, { email_verified: true });
  });
});
