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
    const secondDiv = $("div.layout--wide-center:nth-child(2)").html();
    console.log(secondDiv);

    articleOne.headline = $("h2.zone__title--full-width a").html();
    articleOne.imgURL = $("div.layout--wide-center").html();
    articleOne.url = $("div.zone__inner a").attr("href");
    articleOne.videoURL = $("div.zone__inner video source").attr("src");
    articleOne.publication = process.env.PUBLICATION_1;
    // if (articleOne.headline === null) {
    //   articleOne.headline = $("div.stack_condensed h2").html();
    //   articleOne.imgURL = $("div.stack_condensed img").attr("src");
    //   articleOne.url = $("div.stack_condensed a").attr("href");
    // }
    console.log(articleOne);
    //saveHeadline(articleOne);
  });
}

module.exports = getArticleOne;
