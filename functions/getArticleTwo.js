const cheerio = require("cheerio");
const superagent = require("superagent");
const winston = require("winston");
const saveHeadline = require("../functions/saveHeadline");
const ArticleTwo = require("../classes/ArticleTwo");
const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

//Scrape publication for top article headline and photo
function getArticleTwo() {
  let articleTwo = new ArticleTwo();

  superagent.get(process.env.PUBLICATION_2_URL).end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }
    // Convert response to jquery searchable html
    //Search through website for top headlines and images
    const $ = cheerio.load(res.text);
    articleTwo.html = $("div.big-top").html();
    let source = cheerio.load(articleTwo.html);
    if (source("h3 a").html() != articleTwo.headline) {
      articleTwo.headline = source("h3 a").html();
      if (source("img").attr("src") != null) {
        articleTwo.imgURL = source("img").attr("src");
        //Add https to urls that start without it
        if (articleTwo.imgURL.slice(0, 1) != "h") {
          articleTwo.imgURL = articleTwo.imgURL.slice(2, articleTwo.imgURL.length);
          articleTwo.imgURL = "https://" + articleTwo.imgURL;
        }
      } else if (source("video source").attr("src") != null) {
        articleTwo.videoURL = source("video source").attr("src");
      }
      articleTwo.url = source("h3 a").attr("href");
      articleTwo.publication = process.env.PUBLICATION_2;
      saveHeadline(articleTwo);
      logger.info("New headline saved: " + articleTwo.headline);
    }
  });
}

module.exports = getArticleTwo;
