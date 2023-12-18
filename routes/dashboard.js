const express = require("express");
const router = express.Router();
const calculateGuessAccuracy = require("../functions/calculateGuessAccuracy");
const calculateCrowdBiasPerPublication = require("../functions/calculateCrowdBiasPerPublication");
const calculatePersonalBiasPerPublication = require("../functions/calculatePersonalBiasPerPublication");
const sendVerificationEmail = require("../functions/sendVerificationEmail");

router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let statistics = {};

  if (userLoggedIn) {
    userDocument = await User.findOne({ _id: req.user.id });
    statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });
    const userHeadlines = userDocument.headlines;
    const accuracyData = calculateGuessAccuracy(userHeadlines, statistics);
    const pub1CrowdBias = calculateCrowdBiasPerPublication(process.env.PUBLICATION_1, statistics.pub_1_bias_attributes);
    const pub2CrowdBias = calculateCrowdBiasPerPublication(process.env.PUBLICATION_2, statistics.pub_2_bias_attributes);
    const pub1PersonalBias = calculatePersonalBiasPerPublication(process.env.PUBLICATION_1, userHeadlines);
    const pub2PersonalBias = calculatePersonalBiasPerPublication(process.env.PUBLICATION_2, userHeadlines);

    if (!userDocument.email_verified) {
      const verificationCode = Math.floor(Math.random() * 1000000);
      sendVerificationEmail(userDocument.name, userDocument.email, verificationCode);
      const verifyEmail = await User.findOneAndUpdate(
        { email: userDocument.email },
        { verification_code: verificationCode, verification_code_datetime: new Date() }
      );
    }

    res.json({
      isAuthenticated: userLoggedIn,
      user: req.user,
      email_verified: userDocument.email_verified,
      publicationStats: accuracyData,
      pub_1_crowd_total_bias: pub1CrowdBias.total_bias,
      pub_2_crowd_total_bias: pub2CrowdBias.total_bias,
      pub_1_personal_bias: pub1PersonalBias,
      pub_2_personal_bias: pub2PersonalBias,
      pub_1_crowd_bias: pub1CrowdBias,
      pub_2_crowd_bias: pub2CrowdBias,
    });
  } else {
    /**
     * If user is not logged in, do not send user stats.
     * Tell FE that user is not logged in.
     */
    res.json({ isAuthenticated: userLoggedIn });
  }
});

module.exports = router;
