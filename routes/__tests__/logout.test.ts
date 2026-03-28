import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import logoutRouter from "../logout";

describe("POST /logout", () => {
  it("calls req.logout and destroys session, returns loggedOut: True", async () => {
    const mockDestroy = vi.fn((cb: (err: null) => void) => cb(null));
    const mockLogout = vi.fn((cb: (err: null) => void) => cb(null));

    const app = express();
    app.use(express.json());
    app.use(session({ secret: "test", resave: false, saveUninitialized: true }));
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.logout = mockLogout;
      req.session.destroy = mockDestroy;
      next();
    });
    app.use(logoutRouter);

    const res = await request(app).post("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ loggedOut: "True" });
    expect(mockLogout).toHaveBeenCalledOnce();
    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it("calls next(err) when logout fails", async () => {
    const logoutErr = new Error("logout failed");
    const mockLogout = vi.fn((cb: (err: Error) => void) => cb(logoutErr));

    const app = express();
    app.use(express.json());
    app.use(session({ secret: "test", resave: false, saveUninitialized: true }));
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.logout = mockLogout;
      next();
    });
    app.use(logoutRouter);
    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ error: "handled" });
    });

    const res = await request(app).post("/");
    expect(res.status).toBe(500);
  });
});
