const express = require("express");
const router = express.Router();
const winston = require("winston");
const isEmail = require("validator/lib/isEmail");
const normalizeEmail = require("validator/lib/normalizeEmail");
const sendVerificationEmail = require("../functions/sendVerificationEmail");

const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

//Check for existing email, then make new user with encrypted password
router.post("/", function (req, res) {
  let checkEmail = null;
  if (isEmail(req.body.email)) {
    User.findOne({ email: normalizeEmail(req.body.email) })
      .then((doc) => {
        checkEmail = doc;
      })
      .then(() => {
        if (checkEmail != null) {
          res.json({ available: "False", validEmail: "NA" });
        } else {
          const verificationCode = Math.floor(Math.random() * 1000000);

          //Encryption happens in models/user.js
          const user = new User({
            name: req.body.name,
            email: normalizeEmail(req.body.email),
            password: req.body.password,
            verification_code: verificationCode,
            email_verified: false,
            verification_code_datetime: new Date(),
          });

          user.save().then(() => {
            sendVerificationEmail(req.body.name, req.body.email, verificationCode);
            logger.info("User saved.");
            res.json({ available: "True", validEmail: "True" });
          });
        }
      });
  } else {
    res.json({ available: "False", validEmail: "False" });
  }
});

module.exports = router;
