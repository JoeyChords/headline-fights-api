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

var articleOneURL = "";
var articleOneHeadline = "";
var articleOneImgURL = "";
var articleOneVideoURL = "";
var articleTwoHTML = "";
var articleTwoURL = "";
var articleTwoHeadline = "";
var articleTwoImgURL = "";
var articleTwoVideoURL = "";

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

const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
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

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const headlineSchema = new mongoose.Schema(
  {
    headline: String,
    photo_url: String,
    photo_s3_id: String,
    photo_source_url: String,
    video_url: String,
    video_s3_id: String,
    video_source_url: String,
    publication: String,
    article_url: String,
    times_correctly_chosen: Number,
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
headlineSchema.plugin(passportLocalMongoose);
headlineSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Headline = new mongoose.model("Headline", headlineSchema);

//returns a random headline
app.route("/headlines").get(async (req, res) => {
  try {
    const randomHeadline = await Headline.aggregate([{ $sample: { size: 1 } }]);
    if (randomHeadline[0].photo_source_url != null && randomHeadline[0].headline != null && randomHeadline[0].headline.slice(0, 1) != "<") {
      res.send(randomHeadline);
    } else {
      Headline.deleteOne({ _id: randomHeadline[0]._id });
      logger.info("Corrupt headline deleted: " + randomHeadline[0].headline);
      res.redirect("/headlines");
    }
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
});

function saveHeadline(newHeadline, newArticleURL, newImgURL, newVideoURL, newPublication) {
  const headline = new Headline({
    headline: newHeadline,
    article_url: newArticleURL,
    photo_source_url: newImgURL,
    video_source_url: newVideoURL,
    publication: newPublication,
  });
  headline.save().then(() => {
    console.log("Headline saved.");
  });
}

function getHeadlines() {
  superagent.get(process.env.PUBLICATION_1_URL).end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }
    const $ = cheerio.load(res.text);
    if ($("div.stack_condensed h2").html() != articleOneHeadline) {
      articleOneHeadline = $("div.stack_condensed h2").html();
      articleOneImgURL = $("div.stack_condensed img").attr("src");
      articleOneURL = $("div.stack_condensed a").attr("href");
      saveHeadline(articleOneHeadline, articleOneURL, articleOneImgURL, articleOneVideoURL, process.env.PUBLICATION_1);
      logger.info("New headline saved: " + articleOneHeadline);
    }
  });

  superagent.get(process.env.PUBLICATION_2_URL).end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }
    const $ = cheerio.load(res.text);
    articleTwoHTML = $("div.big-top").html();
    let source = cheerio.load(articleTwoHTML);
    if (source("h3 a").html() != articleTwoHeadline) {
      articleTwoHeadline = source("h3 a").html();
      if (source("img").attr("src") != null) {
        articleTwoImgURL = source("img").attr("src");
        articleTwoImgURL = articleTwoImgURL.slice(2, articleTwoImgURL.length);
        articleTwoImgURL = "https://" + articleTwoImgURL;
      } else if (source("video source").attr("src") != null) {
        articleTwoVideoURL = source("video source").attr("src");
      }
      articleTwoURL = source("h3 a").attr("href");
      saveHeadline(articleTwoHeadline, articleTwoURL, articleTwoImgURL, articleTwoVideoURL, process.env.PUBLICATION_2);
      logger.info("New headline saved: " + articleTwoHeadline);
    }
  });
}

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
