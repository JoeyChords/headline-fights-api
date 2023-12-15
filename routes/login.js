const express = require("express");
const router = express.Router();
const passport = require("passport");
const sendVerificationEmail = require("../functions/sendVerificationEmail");

router.post("/", passport.authenticate("local", { session: true }), async function (req, res, next) {
  if (req.isAuthenticated()) {
    const userDocument = await User.findOne({ email: req.body.email });
    if (!userDocument.email_verified) {
      const verificationCode = Math.floor(Math.random() * 1000000);
      sendVerificationEmail(req.body.name, req.body.email, verificationCode);
      const verifyEmail = await User.findOneAndUpdate(
        { email: req.body.email },
        { verification_code: verificationCode, verification_code_datetime: new Date() }
      );
    }

    return res.json({
      isSignedIn: "True",
      success: true,
      message: "Successful Login",
      user: req.user.name,
      email_verified: req.user.email_verified,
    });
  }
});

module.exports = router;
