const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
var cookieParser = require("cookie-parser");
var cors = require("cors");
require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
var LocalStrategy = require("passport-local");
const winston = require("winston");
const getArticleOne = require("./functions/getArticleOne");
const getArticleTwo = require("./functions/getArticleTwo");
var User = require("./models/user");
var Headline = require("./models/headline");
const saltRounds = 10;

const inProd = process.env.NODE_ENV === "production";

app.use(cookieParser());
app.use(express.static("public"));
// parse application/json
app.use(bodyParser.json());

//Enable cross origin resource sharing for server API to client host
app.use(cors({ credentials: true, origin: "http://localhost" }));

//Set Express sessions and session cookies
app.use(
  session({
    name: "Headline Fights Session",
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_CONNECTION_STRING,
    }),
    cookie: {
      credentials: "include",
      sameSite: `${inProd ? "none" : "lax"}`, // cross site // set lax while working with http:localhost, but none when in prod
      secure: `${inProd ? "true" : "auto"}`, // only https // auto when in development, true when in prod
      maxAge: 1000 * 60 * 60 * 24 * 14, // expiration time
      domain: "localhost",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Set server port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
  console.log("Server started on port " + port);
}
app.listen(port);

//Create logger
const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

//Connect to DB
mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database!");
});

//Use Passport authentication Middleware

//Passport appends user details to Express session
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.name,
      email: user.email,
    });
  });
});

//Passport reads user details from session
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

//Passport authentication starts from request to login route
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

//Headlines route responds with a random headline
app
  .route("/headlines")
  .post(async (req, res) => {
    console.log(req);
    console.log("Authenticated at game? " + req.isAuthenticated());
    console.log("Cookies: ", req.cookies);

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
    } else {
      res.send("<h1>Access forbidden</h1>");
    }
  })
  .get((req, res) => {
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
        console.log(checkEmail);
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

app.post("/login", passport.authenticate("local", { session: true }), function (req, res, next) {
  console.log(req);
  if (req.isAuthenticated()) {
    return res.json({
      isSignedIn: "True",
      success: true,
      message: "Successful Login",
      user: req.user.username,
    });
  }
});

//Use passport logout function
app.post("/logout", function (req, res, next) {
  console.log("Authenticated at logout? " + req.isAuthenticated());

  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.send([{ loggedOut: "True" }]);
});

//Check for new headlines every hour and store new ones in db
setInterval(() => {
  getArticleOne();
  getArticleTwo();
}, 60000 * 60);
