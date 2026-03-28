import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { isStrongPassword } from "validator";
import { User } from "../models/user";

const SALT_ROUNDS = 10;

const router = express.Router();

router.post("/", async function (req: Request, res: Response, _next: NextFunction) {
  const userDocument = await User.findOne({ email: req.body.email });
  if (!userDocument) {
    return res.json({ user_exists: false });
  }

  const minutesElapsed =
    (new Date().getTime() - new Date(userDocument.password_reset_datetime ?? 0).getTime()) / 60000;
  const tokenValid =
    req.body.token && userDocument.password_reset_token && req.body.token === userDocument.password_reset_token;

  if (minutesElapsed < 15 && tokenValid) {
    if (!isStrongPassword(req.body.password)) {
      return res.status(400).json({ submitted_in_time: true, user_exists: true, weak_password: true });
    }
    const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    await User.findOneAndUpdate({ email: userDocument.email }, { password: hash, password_reset_token: null });
    return res.json({ submitted_in_time: true, user_exists: true });
  } else {
    return res.json({ submitted_in_time: false, user_exists: true });
  }
});

export default router;
