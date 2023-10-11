const express = require("express");
const router = express.Router();
const calculateAccuracyData = require("../functions/calculateAccuracyData");

router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let statistics = {};

  if (userLoggedIn) {
    userDocument = await User.findOne({ _id: req.user.id });
    statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });
    const userHeadlines = userDocument.headlines;
    const accuracyData = calculateAccuracyData(userHeadlines, statistics);

    res.json({
      isAuthenticated: userLoggedIn,
      user: req.user,
      publicationStats: accuracyData,
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
