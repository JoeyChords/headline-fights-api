const express = require("express");
const crypto = require("node:crypto");
const router = express.Router();
const User = require("../models/user");
const sendPasswordResetEmail = require("../functions/sendPasswordResetEmail");

router.post("/", async function (req, res, next) {
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

module.exports = router;
