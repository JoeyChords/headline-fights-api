/*
 * This route checks if the email verification code has been sent within 15 minutes, then if the code is correct, then logs the user in if both are true.
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/", async function (req, res, next) {
  const userDocument = await User.findOne({ email: req.body.email });
  const minutesElapsed = (new Date() - new Date(userDocument.verification_code_datetime)) / 60000;

  if (minutesElapsed < 15) {
    if (userDocument.verification_code === parseInt(req.body.code)) {
      //log user in
      req.session.passport = { user: { id: userDocument._id, username: userDocument.name, email: userDocument.email } };
      const verifyEmail = await User.findOneAndUpdate({ email: req.body.email }, { email_verified: true });
      return res.json({
        submitted_in_time: true,
        email_verified: true,
        name: userDocument.name,
      });
    } else {
      return res.json({
        submitted_in_time: true,
        email_verified: false,
      });
    }
  } else {
    return res.json({
      submitted_in_time: false,
    });
  }
});

module.exports = router;

//if less than 15 minutes since else send too long must resend,  if verificationCode is correct switch else send was incorrect code

//passport.authenticate("localEmailVerification", { session: true })

// if (req.isAuthenticated()) {
//     const userDocument = await User.findOne({ email: req.user.email });
//     if (true) {
//       return res.json({
//         isSignedIn: "True",
//         success: true,
//         message: "Successful Login",
//         user: req.user.name,
//       });
//     }
//   } else {
//     return res.json({
//       isSignedIn: "False",
//       success: false,
//       message: "Incorrect Email",
//       user: req.user.name,
//     });
//   }
