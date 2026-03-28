import express, { Request, Response } from "express";
import { User } from "../models/user";
import { HeadlineStat } from "../models/headlineStat";
import { calculateCrowdBiasPerPublication } from "../functions/calculateCrowdBiasPerPublication";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const userLoggedIn = req.isAuthenticated();
    const userCount = await User.countDocuments();
    const statistics = await HeadlineStat.findOne({ _id: process.env.STATISTICS_DOCUMENT_ID });
    if (!statistics) {
      return res.status(500).json({ error: "Server error." });
    }
    const pub1Bias = calculateCrowdBiasPerPublication(
      process.env.PUBLICATION_1 ?? "",
      statistics.pub_1_bias_attributes ?? {}
    );
    const pub2Bias = calculateCrowdBiasPerPublication(
      process.env.PUBLICATION_2 ?? "",
      statistics.pub_2_bias_attributes ?? {}
    );

    return res.json({
      isAuthenticated: userLoggedIn,
      user: req.user,
      numUsers: userCount,
      numPub1Ratings: (statistics.times_pub_1_chosen_correctly ?? 0) + (statistics.times_pub_1_chosen_incorrectly ?? 0),
      numPub2Ratings: (statistics.times_pub_2_chosen_correctly ?? 0) + (statistics.times_pub_2_chosen_incorrectly ?? 0),
      pub_1_total_bias: pub1Bias.total_bias,
      pub_2_total_bias: pub2Bias.total_bias,
    });
  } catch {
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
