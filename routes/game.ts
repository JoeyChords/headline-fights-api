import express, { Request, Response } from "express";
import crypto from "node:crypto";
import { User } from "../models/user";
import { sendVerificationEmail } from "../functions/sendVerificationEmail";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ isAuthenticated: false });
  }

  const userDocument = await User.findOne({ _id: req.user.id });
  if (!userDocument) {
    return res.status(404).json({ isAuthenticated: true, error: "User not found." });
  }

  if (!userDocument.email_verified) {
    const verificationCode = crypto.randomInt(0, 1000000);
    sendVerificationEmail(userDocument.name, userDocument.email, String(verificationCode));
    await User.findOneAndUpdate(
      { email: userDocument.email },
      { verification_code: verificationCode, verification_code_datetime: new Date() }
    );
  }

  return res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    email_verified: userDocument.email_verified,
  });
});

export default router;
