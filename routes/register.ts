import express, { Request, Response } from "express";
import crypto from "node:crypto";
import winston from "winston";
import { isEmail, isStrongPassword, normalizeEmail } from "validator";
import { User } from "../models/user";
import { sendVerificationEmail } from "../functions/sendVerificationEmail";

const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

const router = express.Router();

router.post("/", async function (req: Request, res: Response) {
  if (!isEmail(req.body.email)) {
    return res.json({ available: "False", validEmail: "False" });
  }

  if (!isStrongPassword(req.body.password)) {
    return res.status(400).json({ available: "False", validEmail: "True", weakPassword: "True" });
  }

  const normalizedEmail = normalizeEmail(req.body.email);
  if (!normalizedEmail) {
    return res.json({ available: "False", validEmail: "False" });
  }

  User.findOne({ email: normalizedEmail })
    .then((doc) => {
      if (doc != null) {
        res.json({ available: "False", validEmail: "NA" });
        return;
      }

      const verificationCode = crypto.randomInt(0, 1000000);
      const user = new User({
        name: req.body.name,
        email: normalizedEmail,
        password: req.body.password,
        verification_code: verificationCode,
        email_verified: false,
        verification_code_datetime: new Date(),
      });

      return user
        .save()
        .then(async () => {
          try {
            await sendVerificationEmail(req.body.name, normalizedEmail, String(verificationCode));
            logger.info("User saved.");
            res.json({ available: "True", validEmail: "True" });
          } catch (err) {
            logger.error("Failed to send verification email: " + err);
            res.status(500).json({ error: "Failed to send verification email." });
          }
        })
        .catch((err: unknown) => {
          logger.error(err);
          res.status(500).json({ error: "Failed to create account." });
        });
    })
    .catch((err: unknown) => {
      logger.error(err);
      res.status(500).json({ error: "Server error." });
    });
});

export default router;
