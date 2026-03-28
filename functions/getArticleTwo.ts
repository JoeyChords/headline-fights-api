import * as cheerio from "cheerio";
import superagent from "superagent";
import winston from "winston";
import { saveHeadline } from "./saveHeadline";
import { Article } from "../classes/Article";

const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

export function getArticleTwo(): void {
  const articleTwo = new Article("", "", "", "", "");

  superagent.get(process.env.PUBLICATION_2_URL ?? "").end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }

    const $ = cheerio.load(res.text);
    const html = $("div.big-top").html() ?? "";
    const source = cheerio.load(html);

    if (source("h3 a").html() !== articleTwo.headline) {
      articleTwo.headline = source("h3 a").html() ?? "";

      const imgSrc = source("img").attr("src");
      if (imgSrc != null) {
        let imgURL = imgSrc;
        if (imgURL.slice(0, 1) !== "h") {
          imgURL = "https://" + imgURL.slice(2);
        }
        articleTwo.imgURL = imgURL;
      } else {
        const videoSrc = source("video source").attr("src");
        if (videoSrc != null) {
          articleTwo.videoURL = videoSrc;
        }
      }

      articleTwo.url = source("h3 a").attr("href") ?? "";
      articleTwo.publication = process.env.PUBLICATION_2 ?? "";
      saveHeadline(articleTwo);
      logger.info("New headline saved: " + articleTwo.headline);
    }
  });
}
