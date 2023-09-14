require("dotenv").config();
const express = require("express");
const superagent = require("superagent");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const winston = require("winston");
const app = express();
const bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltFactor = 10;
var cors = require("cors");

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

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());
// parse application/json
app.use(bodyParser.json());

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
    name: String,
    email: String,
    password: String,
    headlines: [
      {
        // the headlines the user has seen and rated
        headline_id: Number,
        publication: String,
        chose_correctly: Boolean, // did the user choose the correct origin publication of the headline?
        democrat_republican_na: String, // the user's feeling about which political party the headline might respresent or if it isn't applicable
        inflammatory_rating: Number, // number from 1 to 10 representing the disturbance the headline seems to want to cause
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(saltFactor, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      return next();
    });
  });
});

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

const User = new mongoose.model("User", userSchema);
const Headline = new mongoose.model("Headline", headlineSchema);

//returns a random headline
app
  .route("/headlines")
  .post(async (req, res) => {
    if (req.query.accessToken == process.env.DATA_API_KEY) {
      try {
        const randomHeadline = await Headline.aggregate([{ $sample: { size: 1 } }]);
        //Filter to find if all info needed is in the dcument and remove if it isn't
        if (
          randomHeadline[0].photo_source_url != null &&
          randomHeadline[0].headline != null &&
          randomHeadline[0].headline.slice(0, 1) != "<" &&
          randomHeadline[0].photo_source_url.slice(0, 1) != "a"
        ) {
          res.send(randomHeadline);
        } else {
          Headline.findByIdAndRemove({
            _id: randomHeadline[0]._id,
          }).exec();

          logger.info("Corrupt headline deleted: " + randomHeadline[0].headline + " id: " + randomHeadline[0]._id);
          res.redirect("/headlines");
        }
      } catch (err) {
        console.log(err);
        logger.error(err);
      }
    }
  })
  .get((req, res) => {
    res.send("<h1>Access forbidden</h1>");
  });

app.route("/register").post(function (req, res) {
  let checkEmail = null;
  User.findOne({ email: req.body.email })
    .then((doc) => {
      checkEmail = doc;
    })
    .then(() => {
      if (checkEmail != null) {
        res.send({ error: "Email already in use" });
      } else {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        user.save().then(() => {
          console.log("User saved.");
        });
      }
    });
});

app.route("/login").get(function (req, res) {
  res.redirect("http://localhost:3001/login");
});

app.route("/login").post();

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
        //Add https to urls that start without it
        if (articleTwoImgURL.slice(0, 1) != "h") {
          articleTwoImgURL = articleTwoImgURL.slice(2, articleTwoImgURL.length);
          articleTwoImgURL = "https://" + articleTwoImgURL;
        }
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
