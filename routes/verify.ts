/*
 * This route checks if the email verification code has been sent within 15 minutes, then if the code is correct, then logs the user in if both are true.
 */

import express, { Request, Response, NextFunction } from "express";
import { User } from "../models/user";

const router = express.Router();

router.post("/", async function (req: Request, res: Response, _next: NextFunction) {
  const userDocument = await User.findOne({ email: req.body.email });
  if (!userDocument) {
    return res.json({ submitted_in_time: false });
  }

  const minutesElapsed =
    (new Date().getTime() - new Date(userDocument.verification_code_datetime ?? 0).getTime()) / 60000;

  if (minutesElapsed < 15) {
    if (userDocument.verification_code === parseInt(req.body.code)) {
      req.session.passport = {
        user: {
          id: String(userDocument._id),
          username: userDocument.name,
          email: userDocument.email,
          email_verified: true,
        },
      };
      await User.findOneAndUpdate({ email: req.body.email }, { email_verified: true });
      return res.json({
        submitted_in_time: true,
        email_verified: true,
        name: userDocument.name,
      });
    } else {
      return res.json({
        submitted_in_time: true,
        email_verified: false,
      });
    }
  } else {
    return res.json({ submitted_in_time: false });
  }
});

export default router;
