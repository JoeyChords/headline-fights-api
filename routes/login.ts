import express, { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import passport from "passport";
import { User } from "../models/user";
import { sendVerificationEmail } from "../functions/sendVerificationEmail";

const router = express.Router();

router.post("/", passport.authenticate("local", { session: true }), async function (req: Request, res: Response, _next: NextFunction) {
  if (req.isAuthenticated()) {
    if (!req.user.email_verified) {
      const verificationCode = crypto.randomInt(0, 1000000);
      sendVerificationEmail(req.user.username, req.user.email, String(verificationCode));
      await User.findOneAndUpdate(
        { email: req.user.email },
        { verification_code: verificationCode, verification_code_datetime: new Date() }
      );
    }

    return res.json({
      isSignedIn: "True",
      success: true,
      message: "Successful Login",
      user: req.user.username,
      email_verified: req.user.email_verified,
    });
  } else {
    return res.status(401).json({ isSignedIn: "False", success: false, message: "Authentication failed" });
  }
});

export default router;
