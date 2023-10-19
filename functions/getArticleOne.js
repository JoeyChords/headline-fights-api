const cheerio = require("cheerio");
const superagent = require("superagent");
const winston = require("winston");
const saveHeadline = require("../functions/saveHeadline");
const Article = require("../classes/Article");
const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

//Scrape publication for top article headline and photo
function getArticleOne() {
  console.log("Here");
  let articleOne = new Article("", "", "", "", "");

  superagent.get(process.env.PUBLICATION_1_URL).end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }
    // Convert response to jquery searchable html
    //Search through website for top headlines and images
    const $ = cheerio.load(res.text);
    if ($("div.stack_condensed h2").html() != articleOne.headline) {
      articleOne.headline = $("div.stack_condensed h2").html();
      articleOne.imgURL = $("div.stack_condensed img").attr("src");
      articleOne.url = $("div.stack_condensed a").attr("href");
      articleOne.publication = process.env.PUBLICATION_1;
      saveHeadline(articleOne);
    }
  });
}

module.exports = getArticleOne;
