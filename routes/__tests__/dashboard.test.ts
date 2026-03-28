import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import dashboardRouter from "../dashboard";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockHeadlineStatFindOne = vi.hoisted(() => vi.fn());
const mockSendVerificationEmail = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOne: mockUserFindOne, findOneAndUpdate: mockUserFindOneAndUpdate },
}));
vi.mock("../../models/headlineStat", () => ({
  HeadlineStat: { findOne: mockHeadlineStatFindOne },
}));
vi.mock("../../functions/calculateGuessAccuracy", () => ({
  calculateGuessAccuracy: vi.fn(() => ({ userPub1Percent: 60 })),
}));
vi.mock("../../functions/calculateCrowdBiasPerPublication", () => ({
  calculateCrowdBiasPerPublication: vi.fn(() => ({ total_bias: 30 })),
}));
vi.mock("../../functions/calculatePersonalBiasPerPublication", () => ({
  calculatePersonalBiasPerPublication: vi.fn(() => ({ total_bias: 20 })),
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

const STATS = { pub_1_bias_attributes: {}, pub_2_bias_attributes: {} };

function makeApp(isAuth: boolean, user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = () => isAuth;
    if (user) req.user = user;
    next();
  });
  app.use(dashboardRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockUserFindOneAndUpdate.mockReset();
  mockHeadlineStatFindOne.mockReset();
  mockSendVerificationEmail.mockReset();
  mockUserFindOneAndUpdate.mockResolvedValue({});
  mockSendVerificationEmail.mockResolvedValue(undefined);
  process.env.PUBLICATION_1 = "Pub One";
  process.env.PUBLICATION_2 = "Pub Two";
  process.env.STATISTICS_DOCUMENT_ID = "statsId";
});

describe("POST /dashboard", () => {
  it("returns isAuthenticated: false when not logged in", async () => {
    const res = await request(makeApp(false)).post("/");
    expect(res.body).toMatchObject({ isAuthenticated: false });
  });

  it("returns publicationStats and bias data for authenticated user", async () => {
    mockUserFindOne.mockResolvedValue({ headlines: [], email_verified: true, name: "Alice", email: "alice@test.com" });
    mockHeadlineStatFindOne.mockResolvedValue(STATS);

    const res = await request(makeApp(true, AUTH_USER)).post("/");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      isAuthenticated: true,
      publicationStats: { userPub1Percent: 60 },
      pub_1_crowd_total_bias: 30,
    });
  });

  it("sends verification email for unverified user", async () => {
    mockUserFindOne.mockResolvedValue({
      headlines: [],
      email_verified: false,
      name: "Bob",
      email: "bob@test.com",
    });
    mockHeadlineStatFindOne.mockResolvedValue(STATS);

    await request(makeApp(true, { ...AUTH_USER, email_verified: false })).post("/");
    expect(mockSendVerificationEmail).toHaveBeenCalledOnce();
  });

  it("returns 500 when user document is missing", async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockHeadlineStatFindOne.mockResolvedValue(STATS);

    const res = await request(makeApp(true, AUTH_USER)).post("/");
    expect(res.status).toBe(500);
  });
});
