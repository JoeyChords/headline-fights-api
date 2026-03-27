const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const User = require("../models/user");
const sendVerificationEmail = require("../functions/sendVerificationEmail");

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ isAuthenticated: false });
  }
  let userDocument = {};
  userDocument = await User.findOne({ _id: req.user.id });
  if (!userDocument.email_verified) {
    const verificationCode = crypto.randomInt(0, 1000000);
    sendVerificationEmail(userDocument.name, userDocument.email, verificationCode);
    const verifyEmail = await User.findOneAndUpdate(
      { email: userDocument.email },
      { verification_code: verificationCode, verification_code_datetime: new Date() }
    );
  }
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user, email_verified: userDocument.email_verified });
});

module.exports = router;
