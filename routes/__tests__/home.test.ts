import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import homeRouter from "../home";

const mockUserCountDocuments = vi.hoisted(() => vi.fn());
const mockHeadlineStatFindOne = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { countDocuments: mockUserCountDocuments },
}));
vi.mock("../../models/headlineStat", () => ({
  HeadlineStat: { findOne: mockHeadlineStatFindOne },
}));
vi.mock("../../functions/calculateCrowdBiasPerPublication", () => ({
  calculateCrowdBiasPerPublication: vi.fn(() => ({ total_bias: 42 })),
}));

const STATS = {
  pub_1_bias_attributes: {},
  pub_2_bias_attributes: {},
  times_pub_1_chosen_correctly: 8,
  times_pub_1_chosen_incorrectly: 2,
  times_pub_2_chosen_correctly: 6,
  times_pub_2_chosen_incorrectly: 4,
};

function makeApp(isAuth = false) {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = () => isAuth;
    next();
  });
  app.use(homeRouter);
  return app;
}

beforeEach(() => {
  mockUserCountDocuments.mockReset();
  mockHeadlineStatFindOne.mockReset();
  mockUserCountDocuments.mockResolvedValue(50);
  mockHeadlineStatFindOne.mockResolvedValue(STATS);
  process.env.STATISTICS_DOCUMENT_ID = "statsId";
  process.env.PUBLICATION_1 = "Pub One";
  process.env.PUBLICATION_2 = "Pub Two";
});

describe("POST /home", () => {
  it("returns user count and pub ratings counts", async () => {
    const res = await request(makeApp()).post("/");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      numUsers: 50,
      numPub1Ratings: 10,
      numPub2Ratings: 10,
    });
  });

  it("returns 500 when statistics document is not found", async () => {
    mockHeadlineStatFindOne.mockResolvedValue(null);
    const res = await request(makeApp()).post("/");
    expect(res.status).toBe(500);
  });
});
