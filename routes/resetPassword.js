const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const isStrongPassword = require("validator/lib/isStrongPassword");
const saltRounds = 10;

router.post("/", async function (req, res, next) {
  const userDocument = await User.findOne({ email: req.body.email });
  if (userDocument) {
    const minutesElapsed = (new Date() - new Date(userDocument.password_reset_datetime)) / 60000;
    const tokenValid =
      req.body.token &&
      userDocument.password_reset_token &&
      req.body.token === userDocument.password_reset_token;
    if (minutesElapsed < 15 && tokenValid) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({ submitted_in_time: true, user_exists: true, weak_password: true });
      }
      const hash = await bcrypt.hash(req.body.password, saltRounds);
      await User.findOneAndUpdate(
        { email: userDocument.email },
        { password: hash, password_reset_token: null }
      );
      return res.json({
        submitted_in_time: true,
        user_exists: true,
      });
    } else {
      return res.json({
        submitted_in_time: false,
        user_exists: true,
      });
    }
  } else {
    return res.json({
      user_exists: false,
    });
  }
});

module.exports = router;
