const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const winston = require("winston");
const getArticleOne = require("./functions/getArticleOne");
const getArticleTwo = require("./functions/getArticleTwo");
const User = require("./models/user");
const Headline = require("./models/headline");
const HeadlineStat = require("./models/headlineStat");
const saveUserFeedback = require("./functions/saveUserFeedback");
const saltRounds = 10;
require("dotenv").config();

const inProd = process.env.NODE_ENV === "production";

app.use(cookieParser());
app.use(express.static("public"));

// parse application/json
app.use(bodyParser.json());

//Enable cross origin resource sharing for server API to client host
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "PUT", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["Set-Cookie", "Authorization"],
    credentials: true,
    maxAge: 600,
  })
);

//Set Express sessions and session cookies
app.use(
  session({
    name: "_Session",
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_CONNECTION_STRING,
    }),
    cookie: {
      httpOnly: true,
      sameSite: `${inProd ? "lax" : "lax"}`,
      secure: `${inProd ? "true" : "auto"}`,
      maxAge: 1000 * 60 * 60 * 24 * 14,
      domain: process.env.DOMAIN,
      path: "/",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
  console.log("Server started on port " + port);
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
  console.log("Connected to the database");
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

/**
 * Headlines route responds with a random headline if the user is logged in
 */
app
  .route("/headlines")
  .post(async (req, res) => {
    const userLoggedIn = req.isAuthenticated();
    let userDocument = {};
    let userFeedback = {};

    if (userLoggedIn) {
      /**
       * Get the user document for use later to test if new random headlines have been seen
       * already by the user.
       */
      userDocument = await User.findOne({ _id: req.user.id });
      /**
       * Check to see if there has been user feedback about headlines from the FE.
       */
      if (req.body.user) {
        userFeedback = req.body;
        /**
         * Update the user document with user feedback about headlines the user has seen
         */
        userDocument = await User.findOneAndUpdate(
          { _id: userFeedback.user },
          {
            $push: {
              headlines: {
                headline_id: userFeedback.headline,
                publication: userFeedback.publicationAnswer,
                chose_correctly: userFeedback.publicationCorrect,
              },
            },
          }
        );
        /**
         * Update the headline document with the user's feedback.
         * Increment if a user guessed it right or wrong.
         *
         * Also update the statistics document to keep track of overall stats.
         */
        if (userFeedback.publicationCorrect) {
          const headlineDocument = await Headline.findOneAndUpdate(
            { _id: userFeedback.headline },
            {
              $inc: {
                times_correctly_chosen: 1,
              },
            }
          );
          if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
            const statistics = await HeadlineStat.findOneAndUpdate(
              { _id: process.env.STATISTICS_DOCUMENT_ID },
              {
                $inc: {
                  times_seen: 1,
                  times_pub_1_chosen_correctly: 1,
                },
              }
            );
          } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
            const statistics = await HeadlineStat.findOneAndUpdate(
              { _id: process.env.STATISTICS_DOCUMENT_ID },
              {
                $inc: {
                  times_seen: 1,
                  times_pub_2_chosen_correctly: 1,
                },
              }
            );
          }
        } else if (!userFeedback.publicationCorrect) {
          const headlineDocument = await Headline.findOneAndUpdate(
            { _id: userFeedback.headline },
            {
              $inc: {
                times_incorrectly_chosen: 1,
              },
            }
          );

          if (userFeedback.publicationAnswer === process.env.PUBLICATION_1) {
            const statistics = await HeadlineStat.findOneAndUpdate(
              { _id: process.env.STATISTICS_DOCUMENT_ID },
              {
                $inc: {
                  times_seen: 1,
                  times_pub_1_chosen_incorrectly: 1,
                },
              }
            );
          } else if (userFeedback.publicationAnswer === process.env.PUBLICATION_2) {
            const statistics = await HeadlineStat.findOneAndUpdate(
              { _id: process.env.STATISTICS_DOCUMENT_ID },
              {
                $inc: {
                  times_seen: 1,
                  times_pub_2_chosen_incorrectly: 1,
                },
              }
            );
          }
        }
      }
      try {
        /**
         * Get random headline
         */
        const randomHeadline = await Headline.aggregate([{ $sample: { size: 1 } }]);
        /**
         * Filter to find if all info needed is in the document
         */
        if (
          randomHeadline[0].photo_source_url === null ||
          randomHeadline[0].headline === null ||
          randomHeadline[0].headline.slice(0, 1) === "<" ||
          randomHeadline[0].photo_source_url.slice(0, 1) === "a"
        ) {
          /**
           * Delete headline if it is missing info
           */
          Headline.findByIdAndRemove({
            _id: randomHeadline[0]._id,
          }).exec();

          logger.info("Corrupt headline deleted: " + randomHeadline[0].headline + " id: " + randomHeadline[0]._id);
          /**
           * If headline was deleted, get a new random headline
           */
          res.json({ isAuthenticated: userLoggedIn, getNewHeadline: "true" });
        } else {
          /**
           * Send random headline if all info is in it and the user has never seen it.
           * Get a new headline if the user has seen it.
           */
          const headlineSeen = await userDocument.headlines.find(({ headline_id }) => headline_id === userFeedback.headline);

          if (headlineSeen === undefined) {
            res.json({ headline: randomHeadline[0], isAuthenticated: userLoggedIn, user: req.user });
          } else {
            console.log("Headline seen. Fetching new random headline.");
            res.json({ isAuthenticated: userLoggedIn, getNewHeadline: "true" });
          }
        }
      } catch (err) {
        console.log(err);
        logger.error(err);
      }
    } else {
      /**
       * If user is not logged in, do not send headline.
       * Tell FE that user is not logged in.
       */
      res.json({ isAuthenticated: userLoggedIn });
    }
  })
  .get((req, res) => {
    /**
     * GET requests forbidden
     */
    res.send("<h1>Access forbidden</h1>");
  });

//Check for existing email, then make new user with encrypted password
app.route("/register").post(function (req, res) {
  let checkEmail = null;
  User.findOne({ email: req.body.email })
    .then((doc) => {
      checkEmail = doc;
    })
    .then(() => {
      if (checkEmail != null) {
        res.json({ available: "False" });
      } else {
        const user = new User({
          name: req.body.name,
          email: req.body.email.toLowerCase(),
          password: req.body.password,
        });

        user.save().then(() => {
          logger.info("User saved.");
          res.json({ available: "True" });
        });
      }
    });
});

app.get("/", (req, res) => {
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

app.get("/dashboard", (req, res) => {
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

app.get("/game", (req, res) => {
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

app.get("/settings", (req, res) => {
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

app.post("/login", passport.authenticate("local", { session: true }), function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.json({
      isSignedIn: "True",
      success: true,
      message: "Successful Login",
      user: req.user.name,
    });
  }
});

//Use passport logout function
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      res.json({ loggedOut: "True" });
    }
  });
});

//Check for new headlines every hour and store new ones in db
setInterval(() => {
  getArticleOne();
  getArticleTwo();
}, 60000 * 180);
