import express, { Request, Response } from "express";
import winston from "winston";
import { User } from "../models/user";
import { Headline, IHeadline } from "../models/headline";

const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const userLoggedIn = req.isAuthenticated();

  if (userLoggedIn && !req.user.email_verified) {
    return res.status(403).json({ isAuthenticated: true, email_verified: false });
  }

  if (!userLoggedIn) {
    return res.json({ isAuthenticated: userLoggedIn });
  }

  const userDocument = await User.findOne({ _id: req.user.id });
  if (!userDocument) {
    return res.status(404).json({ isAuthenticated: true, error: "User not found." });
  }

  async function getUnseenRandomHeadline(): Promise<void> {
    const randomHeadline = await Headline.aggregate<IHeadline>([{ $sample: { size: 1 } }]);
    if (!randomHeadline.length) {
      res.json({ isAuthenticated: true, headline: null });
      return;
    }

    const h = randomHeadline[0];
    const isCorrupt =
      h.photo_source_url == null ||
      h.headline == null ||
      h.headline.slice(0, 1) === "<" ||
      h.photo_source_url.slice(0, 1) === "a";

    if (isCorrupt) {
      Headline.findByIdAndDelete(h._id).exec();
      logger.info("Corrupt headline deleted: " + h.headline + " id: " + String(h._id));
      await getUnseenRandomHeadline();
      return;
    }

    const headlineSeen = userDocument!.headlines.find(
      ({ headline_id }) => headline_id === (h._id as { toString(): string }).toString()
    );

    if (headlineSeen === undefined) {
      res.json({ headline: h, isAuthenticated: userLoggedIn, user: req.user });
    } else {
      console.log("Headline seen. Fetching new random headline.");
      await getUnseenRandomHeadline();
    }
  }

  try {
    await getUnseenRandomHeadline();
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
});

router.get("/", (_req: Request, res: Response) => {
  res.send("<h1>Access forbidden</h1>");
});

export default router;
