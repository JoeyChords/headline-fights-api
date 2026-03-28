import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import loginRouter from "../login";

const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockSendVerificationEmail = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOneAndUpdate: mockUserFindOneAndUpdate },
}));
vi.mock("../../functions/sendVerificationEmail", () => ({
  sendVerificationEmail: mockSendVerificationEmail,
}));
vi.mock("passport", () => ({
  default: {
    authenticate: vi.fn((_strategy: string, _opts: unknown) => (_req: Request, _res: Response, next: NextFunction) => {
      next();
    }),
  },
}));

const VERIFIED_USER: Express.User = {
  id: "user1",
  username: "Alice",
  email: "alice@test.com",
  email_verified: true,
};

const UNVERIFIED_USER: Express.User = {
  id: "user2",
  username: "Bob",
  email: "bob@test.com",
  email_verified: false,
};

function makeApp(isAuth: boolean, user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = () => isAuth;
    if (user) req.user = user;
    next();
  });
  app.use(loginRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOneAndUpdate.mockReset();
  mockSendVerificationEmail.mockReset();
  mockUserFindOneAndUpdate.mockResolvedValue({});
  mockSendVerificationEmail.mockResolvedValue(undefined);
});

describe("POST /login", () => {
  it("returns isSignedIn: True and email_verified: true for verified user", async () => {
    const res = await request(makeApp(true, VERIFIED_USER)).post("/").send({});
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      isSignedIn: "True",
      user: "Alice",
      email_verified: true,
    });
  });

  it("sends verification email when user is not email-verified", async () => {
    await request(makeApp(true, UNVERIFIED_USER)).post("/").send({});
    expect(mockSendVerificationEmail).toHaveBeenCalledWith("Bob", "bob@test.com", expect.any(String));
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(makeApp(false)).post("/").send({});
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ isSignedIn: "False" });
  });
});
