require("dotenv").config();
const express = require("express");
const superagent = require("superagent");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const winston = require("winston");
const app = express();

const date = new Date();
var articleOneURL = "";
var articleOneHeadline = "";
var articleOneImgURL = "";
var articleTwoHTML = "";
var articleTwoURL = "";
var articleTwoHeadline = "";
var articleTwoImgURL = "";

app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
  console.log("Server started on port 3000");
}
app.listen(port);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("We're connected to the database!");
});

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  date_joined: Date,
  lastLogin: Date,
  headlines: {
    // the headlines the user has seen and rated
    headline_id: Number,
    publication: String,
    chose_correctly: Boolean, // did the user choose the correct origin publication of the headline?
    democrat_republican_na: String, // the user's feeling about which political party the headline might respresent or if it isn't applicable
    inflammatory_rating: Number, // number from 1 to 10 representing the disturbance the headline seems to want to cause
  },
});

const headlineSchema = new mongoose.Schema({
  headline: String,
  photo_url: String,
  photo_s3_id: String,
  photo_source_url: String,
  publish_date: Date,
  publication: String,
  article_url: String,
  times_correctly_chosen: Number,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
headlineSchema.plugin(passportLocalMongoose);
headlineSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Headline = new mongoose.model("Headline", headlineSchema);

// const user = new User({ username: "Test", lastLogin: date });
// user.save().then(() => {
//   console.log("User saved.");
// });

function saveHeadline(newHeadline, newArticleURL, newImgURL) {
  const headline = new Headline({ headline: newHeadline, article_url: newArticleURL, photo_source_url: newImgURL, publish_date: date });
  headline.save().then(() => {
    console.log("Headline saved.");
  });
}

function getHeadlines() {
  superagent.get(process.env.PUBLICATION_1).end((err, res) => {
    if (err) {
      logger.log({
        level: "error",
        message: err,
      });
      console.error("Error fetching the website:", err);
      return;
    }
    const $ = cheerio.load(res.text);
    if ($("div.stack_condensed h2").html() != articleOneHeadline) {
      articleOneHeadline = $("div.stack_condensed h2").html();
      articleOneImgURL = $("div.stack_condensed img").attr("src");
      articleOneURL = $("div.stack_condensed a").attr("href");
      saveHeadline(articleOneHeadline, articleOneURL, articleOneImgURL);
      logger.log({
        level: "info",
        message: "New headline saved: " + articleOneHeadline,
      });
    }
  });

  superagent.get(process.env.PUBLICATION_2).end((err, res) => {
    if (err) {
      logger.log({
        level: "error",
        message: err,
      });
      console.error("Error fetching the website:", err);
      return;
    }
    const $ = cheerio.load(res.text);
    articleTwoHTML = $("div.big-top").html();
    let source = cheerio.load(articleTwoHTML);
    if (source("h3 a").html() != articleTwoHeadline) {
      articleTwoHeadline = source("h3 a").html();
      articleTwoImgURL = source("img").attr("src");
      articleTwoImgURL = articleTwoImgURL.slice(2, articleTwoImgURL.length);
      articleTwoURL = source("h3 a").attr("href");
      saveHeadline(articleTwoHeadline, articleTwoURL, articleTwoImgURL);
      logger.log({
        level: "info",
        message: "New headline saved: " + articleTwoHeadline,
      });
    }
  });
}

getHeadlines();

setInterval(() => {
  getHeadlines();
}, 60000 * 60);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.id,
      username: user.username,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
