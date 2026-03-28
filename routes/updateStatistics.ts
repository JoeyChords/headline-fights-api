import express, { Request, Response } from "express";
import { User } from "../models/user";
import { Headline } from "../models/headline";
import { HeadlineStat } from "../models/headlineStat";
import { calculateGuessAccuracy } from "../functions/calculateGuessAccuracy";

const VALID_ATTRIBUTES = new Set([
  "sensationalism",
  "undue_weight_bias",
  "speculative_content",
  "tonality_bias",
  "concision_bias",
  "coverage_bias",
  "distortion_bias",
  "partisan_bias",
  "favors_or_attacks",
  "content_bias",
  "structural_bias",
  "gatekeeping_bias",
  "decision_making_bias",
  "mainstream_bias",
  "false_balance_bias",
]);
const VALID_ANSWERS = new Set(["true", "false", "neither"]);

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const userLoggedIn = req.isAuthenticated();

  if (!userLoggedIn) {
    return res.json({ isAuthenticated: userLoggedIn });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({ isAuthenticated: true, email_verified: false });
  }

  if (!req.body.headline) {
    return res.json({ isAuthenticated: userLoggedIn });
  }

  const { headline, publicationCorrect, publicationAnswer, attribute1, attribute1Answer, attribute2, attribute2Answer } =
    req.body as {
      headline: unknown;
      publicationCorrect: unknown;
      publicationAnswer: unknown;
      attribute1: unknown;
      attribute1Answer: unknown;
      attribute2: unknown;
      attribute2Answer: unknown;
    };

  const validPublications = new Set([process.env.PUBLICATION_1, process.env.PUBLICATION_2]);
  if (
    typeof headline !== "string" ||
    !/^[0-9a-f]{24}$/i.test(headline) ||
    typeof publicationCorrect !== "boolean" ||
    !validPublications.has(publicationAnswer as string) ||
    !VALID_ATTRIBUTES.has(attribute1 as string) ||
    !VALID_ATTRIBUTES.has(attribute2 as string) ||
    !VALID_ANSWERS.has(attribute1Answer as string) ||
    !VALID_ANSWERS.has(attribute2Answer as string)
  ) {
    return res.status(400).json({ error: "Invalid input." });
  }

  await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      $push: {
        headlines: {
          headline_id: headline,
          publication: publicationAnswer,
          chose_correctly: publicationCorrect,
          attribute1,
          attribute1Answer,
          attribute2,
          attribute2Answer,
        },
      },
    }
  );

  async function updateHeadlineDocument(): Promise<void> {
    const timesCorrectOrIncorrect = publicationCorrect ? "times_correctly_chosen" : "times_incorrectly_chosen";
    const biasAttribute1Increment = `bias_attributes.${String(attribute1)}_${String(attribute1Answer)}`;
    const biasAttribute2Increment = `bias_attributes.${String(attribute2)}_${String(attribute2Answer)}`;

    await Headline.findOneAndUpdate(
      { _id: headline as string },
      { $inc: { [timesCorrectOrIncorrect]: 1, [biasAttribute1Increment]: 1, [biasAttribute2Increment]: 1 } }
    );
  }

  async function updateHeadlineStatsDocument(): Promise<void> {
    const pub = publicationAnswer === process.env.PUBLICATION_1 ? "pub_1" : "pub_2";
    const timesPublicationCorrectOrIncorrect = publicationCorrect
      ? `times_${pub}_chosen_correctly`
      : `times_${pub}_chosen_incorrectly`;
    const biasAttribute1Increment = `${pub}_bias_attributes.${String(attribute1)}_${String(attribute1Answer)}`;
    const biasAttribute2Increment = `${pub}_bias_attributes.${String(attribute2)}_${String(attribute2Answer)}`;

    await HeadlineStat.findOneAndUpdate(
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

  await updateHeadlineDocument();
  await updateHeadlineStatsDocument();

  const userDocument = await User.findOne({ _id: req.user.id });
  const statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });

  if (!userDocument || !statistics) {
    return res.status(500).json({ error: "Server error." });
  }

  const accuracyData = calculateGuessAccuracy(userDocument.headlines, statistics);

  return res.json({
    isAuthenticated: userLoggedIn,
    user: req.user,
    publicationStats: accuracyData,
  });
});

export default router;
