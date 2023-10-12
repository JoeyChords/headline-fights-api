const express = require("express");
const router = express.Router();
const winston = require("winston");
const calculateAccuracyData = require("../functions/calculateAccuracyData");
const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

/**
 * Headlines route responds with a random headline if the user is logged in
 */
router.post("/", async (req, res) => {
  const userLoggedIn = req.isAuthenticated();
  let userDocument = {};

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
        const headlineSeen = await userDocument.headlines.find(({ headline_id }) => headline_id === randomHeadline[0]._id.toString());

        if (headlineSeen === undefined) {
          res.json({
            headline: randomHeadline[0],
            isAuthenticated: userLoggedIn,
            user: req.user,
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

router.get("/", (req, res) => {
  /**
   * GET requests forbidden
   */
  res.send("<h1>Access forbidden</h1>");
});

module.exports = router;
