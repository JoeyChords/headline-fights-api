const express = require("express");
const router = express.Router();
const calculateAccuracyData = require("../functions/calculateAccuracyData");

router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let statistics = {};

  userCount = await User.countDocuments();
  statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });
  console.log(userCount);
  console.log(statistics);

  res.json({
    isAuthenticated: userLoggedIn,
    user: req.user,
    numUsers: userCount,
    numPub1Ratings: statistics.times_pub_1_chosen_correctly + statistics.times_pub_1_chosen_incorrectly,
    numPub2Ratings: statistics.times_pub_2_chosen_correctly + statistics.times_pub_2_chosen_incorrectly,
  });
});

module.exports = router;
