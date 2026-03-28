import express, { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { User } from "../models/user";
import { sendPasswordResetEmail } from "../functions/sendPasswordResetEmail";

const router = express.Router();

router.post("/", async function (req: Request, res: Response, _next: NextFunction) {
  const token = crypto.randomUUID();
  const userDocument = await User.findOne({ email: req.body.email });
  if (userDocument) {
    await User.findOneAndUpdate(
      { email: userDocument.email },
      { password_reset_token: token, password_reset_datetime: new Date() }
    );
    sendPasswordResetEmail(userDocument.name, userDocument.email, token);
  }
  return res.json({ email_sent: true });
});

export default router;
