import express, { Request, Response } from "express";
import crypto from "node:crypto";
import { User } from "../models/user";
import { HeadlineStat } from "../models/headlineStat";
import { calculateGuessAccuracy } from "../functions/calculateGuessAccuracy";
import { calculateCrowdBiasPerPublication } from "../functions/calculateCrowdBiasPerPublication";
import { calculatePersonalBiasPerPublication } from "../functions/calculatePersonalBiasPerPublication";
import { sendVerificationEmail } from "../functions/sendVerificationEmail";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const userLoggedIn = req.isAuthenticated();

  if (!userLoggedIn) {
    return res.json({ isAuthenticated: userLoggedIn });
  }

  try {
    const userDocument = await User.findOne({ _id: req.user.id });
    const statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });

    if (!userDocument || !statistics) {
      return res.status(500).json({ error: "Server error." });
    }

    const userHeadlines = userDocument.headlines;
    const accuracyData = calculateGuessAccuracy(userHeadlines, statistics);
    const pub1CrowdBias = calculateCrowdBiasPerPublication(
      process.env.PUBLICATION_1 ?? "",
      statistics.pub_1_bias_attributes ?? {}
    );
    const pub2CrowdBias = calculateCrowdBiasPerPublication(
      process.env.PUBLICATION_2 ?? "",
      statistics.pub_2_bias_attributes ?? {}
    );
    const pub1PersonalBias = calculatePersonalBiasPerPublication(process.env.PUBLICATION_1 ?? "", userHeadlines);
    const pub2PersonalBias = calculatePersonalBiasPerPublication(process.env.PUBLICATION_2 ?? "", userHeadlines);

    if (!userDocument.email_verified) {
      const verificationCode = crypto.randomInt(0, 1000000);
      sendVerificationEmail(userDocument.name, userDocument.email, String(verificationCode));
      await User.findOneAndUpdate(
        { email: userDocument.email },
        { verification_code: verificationCode, verification_code_datetime: new Date() }
      );
    }

    return res.json({
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
  } catch {
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
