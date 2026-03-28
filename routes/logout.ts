import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

router.post("/", function (req: Request, res: Response, next: NextFunction) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (sessionErr) {
      if (sessionErr) {
        return next(sessionErr);
      }
      res.json({ loggedOut: "True" });
    });
  });
});

export default router;
