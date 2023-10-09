const { router } = require("./headlines");

/**
 * Headlines route responds with a random headline if the user is logged in
 */
router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};
  let userFeedback = {};

  if (userLoggedIn) {
    /**
     * Get the user document for use later to test if new random headlines have been seen
     * already by the user. This is for when reqs come in again because a headline has been
     * seen, there is no body, and we don't want to update any user.
     */
    userDocument = await User.findOne({ _id: req.user.id });
    /**
     * Check to see if there has been user feedback about headlines from the FE.
     */
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
      userDocument = await User.findOne({ _id: req.user.id });

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
          const statistics = await HeadlineStat.findOneAndUpdate(
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
    try {
      /**
       * Get random headline
       */
      const randomHeadline = await Headline.aggregate([{ $sample: { size: 1 } }]);
      /**
       * Filter to find if all info needed is in the document
       */
      if (
        randomHeadline[0].photo_source_url === null ||
        randomHeadline[0].headline === null ||
        randomHeadline[0].headline.slice(0, 1) === "<" ||
        randomHeadline[0].photo_source_url.slice(0, 1) === "a"
      ) {
        /**
         * Delete headline if it is missing info
         */
        Headline.findByIdAndRemove({
          _id: randomHeadline[0]._id,
        }).exec();

        logger.info("Corrupt headline deleted: " + randomHeadline[0].headline + " id: " + randomHeadline[0]._id);
        /**
         * If headline was deleted, get a new random headline
         */
        res.json({ isAuthenticated: userLoggedIn, getNewHeadline: "true" });
      } else {
        /**
         * Send random headline if all info is in it and the user has never seen it.
         * Get a new headline if the user has seen it.
         */
        const headlineSeen = await userDocument.headlines.find(({ headline_id }) => headline_id === userFeedback.headline);

        if (headlineSeen === undefined) {
          const userHeadlines = userDocument.headlines;
          const userHeadlineCount = userHeadlines.length;
          const pub1Only = array.filter((userHeadlines) => userHeadlines.publication === PUBLICATION_1);
          const pub1CorrectCount = array.reduce((counter, pub1Only) => (userHeadlines.chose_correctly === true ? ++counter : counter), 0);
          const pub2Only = array.filter((userHeadlines) => userHeadlines.publication === PUBLICATION_2);
          const pub2CorrectCount = array.reduce((counter, pub2Only) => (userHeadlines.chose_correctly === true ? ++counter : counter), 0);
          const pub1CorrectPercent = (pub1CorrectCount / userHeadlineCount) * 100;
          const pub2CorrectPercent = (pub2CorrectCount / userHeadlineCount) * 100;

          res.json({
            headline: randomHeadline[0],
            isAuthenticated: userLoggedIn,
            user: req.user,
            userPub1Percent: pub1CorrectPercent,
            userPub2Percent: pub2CorrectPercent,
            crowdPub1Percent: 0,
            crowdPub2Percent: 0,
          });
        } else {
          console.log("Headline seen. Fetching new random headline.");
          res.json({ isAuthenticated: userLoggedIn, getNewHeadline: "true" });
        }
      }
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  } else {
    /**
     * If user is not logged in, do not send headline.
     * Tell FE that user is not logged in.
     */
    res.json({ isAuthenticated: userLoggedIn });
  }
});
