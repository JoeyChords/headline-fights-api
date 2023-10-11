const express = require("express");
const router = express.Router();
const calculateAccuracyData = require("../functions/calculateAccuracyData");

router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let userFeedback = {};
  let statistics = {};
  if (userLoggedIn) {
    if (req.body.user) {
      userFeedback = req.body;
      /**
       * Update the user document with user feedback about headlines the user has seen
       */
      userDocument = await User.findOneAndUpdate(
        { _id: userFeedback.user },
        {
          $push: {
            headlines: {
              headline_id: userFeedback.headline,
              publication: userFeedback.publicationAnswer,
              chose_correctly: userFeedback.publicationCorrect,
            },
          },
        }
      );

      /**
       * Update the headline document with the user's feedback.
       * Increment if a user guessed it right or wrong.
       *
       * Also update the statistics document to keep track of overall stats.
       */
      if (userFeedback.publicationCorrect) {
        const headlineDocument = await Headline.findOneAndUpdate(
          { _id: userFeedback.headline },
          {
            $inc: {
              times_correctly_chosen: 1,
            },
          }
        );
        if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
          statistics = await HeadlineStat.findOneAndUpdate(
            { _id: process.env.STATISTICS_DOCUMENT_ID },
            {
              $inc: {
                times_seen: 1,
                times_pub_1_chosen_correctly: 1,
              },
            }
          );
        } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
          const statistics = await HeadlineStat.findOneAndUpdate(
            { _id: process.env.STATISTICS_DOCUMENT_ID },
            {
              $inc: {
                times_seen: 1,
                times_pub_2_chosen_correctly: 1,
              },
            }
          );
        }
      } else if (!userFeedback.publicationCorrect) {
        const headlineDocument = await Headline.findOneAndUpdate(
          { _id: userFeedback.headline },
          {
            $inc: {
              times_incorrectly_chosen: 1,
            },
          }
        );

        if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
          const statistics = await HeadlineStat.findOneAndUpdate(
            { _id: process.env.STATISTICS_DOCUMENT_ID },
            {
              $inc: {
                times_seen: 1,
                times_pub_1_chosen_incorrectly: 1,
              },
            }
          );
        } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
          const statistics = await HeadlineStat.findOneAndUpdate(
            { _id: process.env.STATISTICS_DOCUMENT_ID },
            {
              $inc: {
                times_seen: 1,
                times_pub_2_chosen_incorrectly: 1,
              },
            }
          );
        }
      }
    }

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
     * If user is not logged in, do not send headline.
     * Tell FE that user is not logged in.
     */
    res.json({ isAuthenticated: userLoggedIn });
  }
});

module.exports = router;
