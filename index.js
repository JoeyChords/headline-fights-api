const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
var cors = require("cors");
require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
var LocalStrategy = require("passport-local");
const superagent = require("superagent");
const winston = require("winston");
var User = require("./models/user");
var Headline = require("./models/headline");
const saltRounds = 10;

var articleOneURL = "";
var articleOneHeadline = "";
var articleOneImgURL = "";
var articleOneVideoURL = "";
var articleTwoHTML = "";
var articleTwoURL = "";
var articleTwoHeadline = "";
var articleTwoImgURL = "";
var articleTwoVideoURL = "";

const inProd = process.env.NODE_ENV === "production";

app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      crentials: "include",
      sameSite: `${inProd ? "none" : "lax"}`, // cross site // set lax while working with http:localhost, but none when in prod
      secure: `${inProd ? "true" : "auto"}`, // only https // auto when in development, true when in prod
      maxAge: 1000 * 60 * 60 * 24 * 14, // expiration time
    },
  })
);

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

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

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.name,
      email: user.email,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) return done(null, false);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false);
        // if passwords match return user
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error, false);
      }
    }
  )
);

//returns a random headline
app
  .route("/headlines")
  .post(async (req, res) => {
    console.log(req.session);
    console.log(req.session.passport);
    if (req.query.accessToken == process.env.DATA_API_KEY) {
      try {
        const randomHeadline = await Headline.aggregate([{ $sample: { size: 1 } }]);
        //Filter to find if all info needed is in the document and remove if it isn't
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
        res.send([{ available: "False" }]);
      } else {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        user.save().then(() => {
          console.log("User saved.");
          res.send([{ available: "True" }]);
        });
      }
    });
});

app.post("/login", passport.authenticate("local", { session: true }), function (req, res) {
  if (req.user) {
    res.json({ isSignedIn: "True" });
  }
});

app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    console.log("Logged out");
  });
});

//Create document for scraped headlines
function saveHeadline(newHeadline, newArticleURL, newImgURL, newVideoURL, newPublication) {
  //Filter so that unusable headlines aren't saved
  if (newHeadline != null && newImgURL != null && newHeadline.slice(0, 1) != "<") {
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
  } else {
    console.log("Headline corrupt. Not saved.");
  }
}

function getHeadlines() {
  superagent.get(process.env.PUBLICATION_1_URL).end((err, res) => {
    if (err) {
      logger.error(err);
      console.error("Error fetching the website:", err);
      return;
    }
    // Convert response to jquery searchable html
    //Search through website for top headlines and images
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
    // Convert response to jquery searchable html
    //Search through website for top headlines and images
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

//Check for new headlines every hour and store new ones in db
setInterval(() => {
  getHeadlines();
}, 60000 * 60);
