const express = require("express");
const router = express.Router();
const winston = require("winston");
const isEmail = require("validator/lib/isEmail");
const normalizeEmail = require("validator/lib/normalizeEmail");

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
          const user = new User({
            name: req.body.name,
            email: normalizeEmail(req.body.email),
            password: req.body.password,
          });

          user.save().then(() => {
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
