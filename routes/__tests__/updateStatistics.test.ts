import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import updateStatisticsRouter from "../updateStatistics";

const mockUserFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockHeadlineFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockHeadlineStatFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockHeadlineStatFindOne = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOneAndUpdate: mockUserFindOneAndUpdate, findOne: mockUserFindOne },
}));
vi.mock("../../models/headline", () => ({
  Headline: { findOneAndUpdate: mockHeadlineFindOneAndUpdate },
}));
vi.mock("../../models/headlineStat", () => ({
  HeadlineStat: { findOneAndUpdate: mockHeadlineStatFindOneAndUpdate, findOne: mockHeadlineStatFindOne },
}));
vi.mock("../../functions/calculateGuessAccuracy", () => ({
  calculateGuessAccuracy: vi.fn(() => ({ userPub1Percent: 75 })),
}));

const AUTH_USER: Express.User = {
  id: "user1",
  username: "Alice",
  email: "alice@test.com",
  email_verified: true,
};

const VALID_FEEDBACK = {
  headline: "abc123abc123abc123abc123",
  publicationCorrect: true,
  publicationAnswer: "Pub One",
  attribute1: "sensationalism",
  attribute1Answer: "true",
  attribute2: "tonality_bias",
  attribute2Answer: "false",
};

function makeApp(isAuth: boolean, user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = () => isAuth;
    if (user) req.user = user;
    next();
  });
  app.use(updateStatisticsRouter);
  return app;
}

beforeEach(() => {
  [
    mockUserFindOneAndUpdate,
    mockUserFindOne,
    mockHeadlineFindOneAndUpdate,
    mockHeadlineStatFindOneAndUpdate,
    mockHeadlineStatFindOne,
  ].forEach((m) => m.mockReset());

  mockUserFindOneAndUpdate.mockResolvedValue({});
  mockHeadlineFindOneAndUpdate.mockResolvedValue({});
  mockHeadlineStatFindOneAndUpdate.mockResolvedValue({});
  mockUserFindOne.mockResolvedValue({ headlines: [] });
  mockHeadlineStatFindOne.mockResolvedValue({ times_pub_1_chosen_correctly: 5 });
  process.env.PUBLICATION_1 = "Pub One";
  process.env.PUBLICATION_2 = "Pub Two";
  process.env.STATISTICS_DOCUMENT_ID = "statsId";
});

describe("POST /updateStatistics", () => {
  it("returns isAuthenticated: false when not logged in", async () => {
    const res = await request(makeApp(false)).post("/");
    expect(res.body).toMatchObject({ isAuthenticated: false });
  });

  it("returns 403 for unverified user", async () => {
    const res = await request(makeApp(true, { ...AUTH_USER, email_verified: false })).post("/");
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid headline id format", async () => {
    const res = await request(makeApp(true, AUTH_USER))
      .post("/")
      .send({ ...VALID_FEEDBACK, headline: "not-an-object-id" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Invalid input." });
  });

  it("returns 400 for invalid attribute", async () => {
    const res = await request(makeApp(true, AUTH_USER))
      .post("/")
      .send({ ...VALID_FEEDBACK, attribute1: "invalid_attribute" });
    expect(res.status).toBe(400);
  });

  it("updates all documents and returns accuracy data on valid input", async () => {
    const res = await request(makeApp(true, AUTH_USER)).post("/").send(VALID_FEEDBACK);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ isAuthenticated: true, publicationStats: { userPub1Percent: 75 } });
    expect(mockUserFindOneAndUpdate).toHaveBeenCalledOnce();
    expect(mockHeadlineFindOneAndUpdate).toHaveBeenCalledOnce();
    expect(mockHeadlineStatFindOneAndUpdate).toHaveBeenCalledOnce();
  });
});
