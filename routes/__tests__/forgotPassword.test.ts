import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import forgotPasswordRouter from "../forgotPassword";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockSendPasswordResetEmail = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOne: mockUserFindOne, findOneAndUpdate: mockUserFindOneAndUpdate },
}));
vi.mock("../../functions/sendPasswordResetEmail", () => ({
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(forgotPasswordRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockUserFindOneAndUpdate.mockReset();
  mockSendPasswordResetEmail.mockReset();
  mockUserFindOneAndUpdate.mockResolvedValue({});
  mockSendPasswordResetEmail.mockResolvedValue(undefined);
});

describe("POST /forgotPassword", () => {
  it("always returns email_sent: true", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const res = await request(makeApp()).post("/").send({ email: "notfound@test.com" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ email_sent: true });
  });

  it("sends password reset email when user exists", async () => {
    mockUserFindOne.mockResolvedValue({ name: "Alice", email: "alice@test.com" });
    await request(makeApp()).post("/").send({ email: "alice@test.com" });
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith("Alice", "alice@test.com", expect.any(String));
  });

  it("does not send email when user does not exist", async () => {
    mockUserFindOne.mockResolvedValue(null);
    await request(makeApp()).post("/").send({ email: "nobody@test.com" });
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
