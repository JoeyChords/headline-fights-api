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

export function getArticleOne(): void {
  const articleOne = new Article("", "", "", "", "");

  superagent.get(process.env.PUBLICATION_1_URL ?? "").end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }

    const $ = cheerio.load(res.text);
    if ($("div.stack_condensed h2").html() !== articleOne.headline) {
      articleOne.headline = $("div.stack_condensed h2").html() ?? "";
      articleOne.imgURL = $("div.stack_condensed img").attr("src") ?? "";
      articleOne.url = $("div.stack_condensed a").attr("href") ?? "";
      articleOne.publication = process.env.PUBLICATION_1 ?? "";
      saveHeadline(articleOne);
    }
  });
}
