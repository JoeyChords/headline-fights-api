const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/", passport.authenticate("local", { session: true }), function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.json({
      isSignedIn: "True",
      success: true,
      message: "Successful Login",
      user: req.user.name,
    });
  }
});

module.exports = router;
