const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const winston = require("winston");
const User = require("../models/user");
const isEmail = require("validator/lib/isEmail");
const isStrongPassword = require("validator/lib/isStrongPassword");
const normalizeEmail = require("validator/lib/normalizeEmail");
const sendVerificationEmail = require("../functions/sendVerificationEmail");

const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

//Check for existing email, then make new user with encrypted password
router.post("/", async function (req, res) {
  let checkEmail = null;
  if (isEmail(req.body.email) && isStrongPassword(req.body.password)) {
    User.findOne({ email: normalizeEmail(req.body.email) })
      .then((doc) => {
        checkEmail = doc;
      })
      .then(() => {
        if (checkEmail != null) {
          res.json({ available: "False", validEmail: "NA" });
        } else {
          const verificationCode = crypto.randomInt(0, 1000000);

          //Encryption happens in models/user.js
          const user = new User({
            name: req.body.name,
            email: normalizeEmail(req.body.email),
            password: req.body.password,
            verification_code: verificationCode,
            email_verified: false,
            verification_code_datetime: new Date(),
          });

          user.save().then(async () => {
            try {
              await sendVerificationEmail(req.body.name, normalizeEmail(req.body.email), verificationCode);
              logger.info("User saved.");
              res.json({ available: "True", validEmail: "True" });
            } catch (err) {
              logger.error("Failed to send verification email: " + err);
              res.status(500).json({ error: "Failed to send verification email." });
            }
          }).catch((err) => {
            logger.error(err);
            res.status(500).json({ error: "Failed to create account." });
          });
        }
      }).catch((err) => {
        logger.error(err);
        res.status(500).json({ error: "Server error." });
      });
  } else if (!isEmail(req.body.email)) {
    res.json({ available: "False", validEmail: "False" });
  } else {
    res.status(400).json({ available: "False", validEmail: "True", weakPassword: "True" });
  }
});

module.exports = router;
