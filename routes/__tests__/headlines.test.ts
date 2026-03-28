import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import headlinesRouter from "../headlines";

const mockUserFindOne = vi.hoisted(() => vi.fn());
const mockHeadlineAggregate = vi.hoisted(() => vi.fn());
const mockHeadlineFindByIdAndDelete = vi.hoisted(() => vi.fn());

vi.mock("../../models/user", () => ({
  User: { findOne: mockUserFindOne },
}));
vi.mock("../../models/headline", () => ({
  Headline: {
    aggregate: mockHeadlineAggregate,
    findByIdAndDelete: vi.fn(() => ({ exec: vi.fn() })),
  },
}));

const AUTH_USER: Express.User = {
  id: "user1",
  username: "Alice",
  email: "alice@test.com",
  email_verified: true,
};

const SAMPLE_HEADLINE = {
  _id: "abc123abc123abc123abc123",
  headline: "Test Headline",
  photo_source_url: "https://example.com/img.jpg",
  publication: "Pub One",
};

function makeApp(isAuth: boolean, user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = () => isAuth;
    if (user) req.user = user;
    next();
  });
  app.use(headlinesRouter);
  return app;
}

beforeEach(() => {
  mockUserFindOne.mockReset();
  mockHeadlineAggregate.mockReset();
  vi.mocked(mockHeadlineFindByIdAndDelete).mockReset?.();
});

describe("POST /headlines", () => {
  it("returns isAuthenticated: false when not logged in", async () => {
    const res = await request(makeApp(false)).post("/");
    expect(res.body).toMatchObject({ isAuthenticated: false });
  });

  it("returns 403 for authenticated but unverified user", async () => {
    const res = await request(makeApp(true, { ...AUTH_USER, email_verified: false })).post("/");
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ email_verified: false });
  });

  it("returns a headline for authenticated verified user who hasn't seen it", async () => {
    mockUserFindOne.mockResolvedValue({ headlines: [] });
    mockHeadlineAggregate.mockResolvedValue([SAMPLE_HEADLINE]);

    const res = await request(makeApp(true, AUTH_USER)).post("/");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ headline: { headline: "Test Headline" } });
  });

  it("returns null headline when there are no headlines in db", async () => {
    mockUserFindOne.mockResolvedValue({ headlines: [] });
    mockHeadlineAggregate.mockResolvedValue([]);

    const res = await request(makeApp(true, AUTH_USER)).post("/");
    expect(res.body).toMatchObject({ headline: null });
  });
});

describe("GET /headlines", () => {
  it("returns access forbidden HTML", async () => {
    const res = await request(makeApp(false)).get("/");
    expect(res.text).toContain("Access forbidden");
  });
});
