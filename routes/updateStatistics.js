const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Headline = require("../models/headline");
const HeadlineStat = require("../models/headlineStat");
const calculateGuessAccuracy = require("../functions/calculateGuessAccuracy");

const VALID_ATTRIBUTES = new Set([
  "sensationalism", "undue_weight_bias", "speculative_content", "tonality_bias",
  "concision_bias", "coverage_bias", "distortion_bias", "partisan_bias",
  "favors_or_attacks", "content_bias", "structural_bias", "gatekeeping_bias",
  "decision_making_bias", "mainstream_bias", "false_balance_bias",
]);
const VALID_ANSWERS = new Set(["true", "false", "neither"]);

router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let userFeedback = {};
  let statistics = {};
  if (userLoggedIn) {
    if (!req.user.email_verified) {
      return res.status(403).json({ isAuthenticated: true, email_verified: false });
    }
    if (req.body.headline) {
      const { headline, publicationCorrect, publicationAnswer, attribute1, attribute1Answer, attribute2, attribute2Answer } = req.body;
      const validPublications = new Set([process.env.PUBLICATION_1, process.env.PUBLICATION_2]);
      if (
        typeof headline !== "string" || !/^[0-9a-f]{24}$/i.test(headline) ||
        typeof publicationCorrect !== "boolean" ||
        !validPublications.has(publicationAnswer) ||
        !VALID_ATTRIBUTES.has(attribute1) ||
        !VALID_ATTRIBUTES.has(attribute2) ||
        !VALID_ANSWERS.has(attribute1Answer) ||
        !VALID_ANSWERS.has(attribute2Answer)
      ) {
        return res.status(400).json({ error: "Invalid input." });
      }
      userFeedback = req.body;
      /**
       * Update the user document with user feedback about headlines the user has seen
       */
      userDocument = await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          $push: {
            headlines: {
              headline_id: userFeedback.headline,
              publication: userFeedback.publicationAnswer,
              chose_correctly: userFeedback.publicationCorrect,
              attribute1: userFeedback.attribute1,
              attribute1Answer: userFeedback.attribute1Answer,
              attribute2: userFeedback.attribute2,
              attribute2Answer: userFeedback.attribute2Answer,
            },
          },
        }
      );

      /**
       * Update the headline document with the user's feedback.
       * Increment if a user guessed the publication right or wrong.
       * Indicate the user's answers about bias types in the headline.
       *
       * Update the statistics document to keep track of overall stats.
       */

      async function updateHeadlineDocument(publicationCorrect, biasAttribute1, biasAttribute1Answer, biasAttribute2, biasAttribute2Answer) {
        const timesCorrectOrIncorrect = publicationCorrect ? "times_correctly_chosen" : "times_incorrectly_chosen";
        const biasAttribute1Increment = `bias_attributes.${biasAttribute1}_${biasAttribute1Answer}`;
        const biasAttribute2Increment = `bias_attributes.${biasAttribute2}_${biasAttribute2Answer}`;

        const headlineDocument = await Headline.findOneAndUpdate(
          { _id: userFeedback.headline },
          {
            $inc: {
              [timesCorrectOrIncorrect]: 1,
              [biasAttribute1Increment]: 1,
              [biasAttribute2Increment]: 1,
            },
          }
        );
      }

      async function updateHeadlineStatsDocument(
        publicationCorrect,
        publicationAnswer,
        biasAttribute1,
        biasAttribute1Answer,
        biasAttribute2,
        biasAttribute2Answer
      ) {
        const publication = publicationAnswer === process.env.PUBLICATION_1 ? "pub_1" : "pub_2";
        const timesPublicationCorrectOrIncorrect = publicationCorrect
          ? `times_${publication}_chosen_correctly`
          : `times_${publication}_chosen_incorrectly`;
        const biasAttribute1Increment = `${publication}_bias_attributes.${biasAttribute1}_${biasAttribute1Answer}`;
        const biasAttribute2Increment = `${publication}_bias_attributes.${biasAttribute2}_${biasAttribute2Answer}`;

        statistics = await HeadlineStat.findOneAndUpdate(
          { _id: process.env.STATISTICS_DOCUMENT_ID },
          {
            $inc: {
              times_seen: 1,
              [timesPublicationCorrectOrIncorrect]: 1,
              [biasAttribute1Increment]: 1,
              [biasAttribute2Increment]: 1,
            },
          }
        );
      }

      await updateHeadlineDocument(
        userFeedback.publicationCorrect,
        userFeedback.attribute1,
        userFeedback.attribute1Answer,
        userFeedback.attribute2,
        userFeedback.attribute2Answer
      );

      await updateHeadlineStatsDocument(
        userFeedback.publicationCorrect,
        userFeedback.publicationAnswer,
        userFeedback.attribute1,
        userFeedback.attribute1Answer,
        userFeedback.attribute2,
        userFeedback.attribute2Answer
      );

      userDocument = await User.findOne({ _id: req.user.id });
      statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });
      const userHeadlines = userDocument.headlines;
      const accuracyData = calculateGuessAccuracy(userHeadlines, statistics);

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
  }
});

module.exports = router;
