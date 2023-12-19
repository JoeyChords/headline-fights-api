const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/", async function (req, res, next) {
  const userDocument = await User.findOne({ email: req.body.email });
  if (userDocument) {
    const minutesElapsed = (new Date() - new Date(userDocument.password_reset_datetime)) / 60000;
    if (minutesElapsed < 15) {
      bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
        const updateUser = await User.findOneAndUpdate({ email: userDocument.email }, { password: hash });
      });

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
