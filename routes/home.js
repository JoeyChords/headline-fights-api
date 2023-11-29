const express = require("express");
const router = express.Router();
const calculateTotalBiasPerPublication = require("../functions/calculateTotalBiasPerPublication");

router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let statistics = {};

  userCount = await User.countDocuments();
  statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });

  const pub1Bias = calculateTotalBiasPerPublication(statistics.pub_1_bias_attributes);
  const pub2Bias = calculateTotalBiasPerPublication(statistics.pub_2_bias_attributes);

  res.json({
    isAuthenticated: userLoggedIn,
    user: req.user,
    numUsers: userCount,
    numPub1Ratings: statistics.times_pub_1_chosen_correctly + statistics.times_pub_1_chosen_incorrectly,
    numPub2Ratings: statistics.times_pub_2_chosen_correctly + statistics.times_pub_2_chosen_incorrectly,
    pub_1_total_bias: pub1Bias,
    pub_2_total_bias: pub2Bias,
  });
});

module.exports = router;
