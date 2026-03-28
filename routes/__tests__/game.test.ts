import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import gameRouter from "../game";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockSendVerificationEmail = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOne: mockUserFindOne, findOneAndUpdate: mockUserFindOneAndUpdate },
}));
vi.mock("../../functions/sendVerificationEmail", () => ({
  sendVerificationEmail: mockSendVerificationEmail,
}));

const AUTH_USER: Express.User = {
  id: "user1",
  username: "Alice",
  email: "alice@test.com",
  email_verified: true,
};

function makeApp(isAuth: boolean, user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = () => isAuth;
    if (user) req.user = user;
    next();
  });
  app.use(gameRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockUserFindOneAndUpdate.mockReset();
  mockSendVerificationEmail.mockReset();
  mockUserFindOneAndUpdate.mockResolvedValue({});
  mockSendVerificationEmail.mockResolvedValue(undefined);
});

describe("GET /game", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(makeApp(false)).get("/");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ isAuthenticated: false });
  });

  it("returns isAuthenticated and email_verified for verified user", async () => {
    mockUserFindOne.mockResolvedValue({ email_verified: true, name: "Alice", email: "alice@test.com" });
    const res = await request(makeApp(true, AUTH_USER)).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ isAuthenticated: true, email_verified: true });
  });

  it("sends verification email for unverified user", async () => {
    mockUserFindOne.mockResolvedValue({ email_verified: false, name: "Bob", email: "bob@test.com" });
    await request(makeApp(true, { ...AUTH_USER, email_verified: false })).get("/");
    expect(mockSendVerificationEmail).toHaveBeenCalledOnce();
  });
});
