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
const getArticleOne = require("./functions/getArticleOne");
const getArticleTwo = require("./functions/getArticleTwo");
const User = require("./models/user");
const Headline = require("./models/headline");
const HeadlineStat = require("./models/headlineStat");
const saveUserFeedback = require("./functions/saveUserFeedback");
const saltRounds = 10;
const headlines = require("./routes/headlines");
const home = require("./routes/home");
const logout = require("./routes/logout");
const login = require("./routes/login");
const register = require("./routes/register");
const settings = require("./routes/settings");
const dashboard = require("./routes/dashboard");
const game = require("./routes/game");
const verify = require("./routes/verify");
const resetPassword = require("./routes/resetPassword");
const forgotPassword = require("./routes/forgotPassword");
const updateStatistics = require("./routes/updateStatistics");

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

app.use("/home", home);
app.use("/headlines", headlines);
app.use("/dashboard", dashboard);
app.use("/forgotPassword", forgotPassword);
app.use("/game", game);
app.use("/login", login);
app.use("/logout", logout);
app.use("/register", register);
app.use("/resetPassword", resetPassword);
app.use("/settings", settings);
app.use("/updateStatistics", updateStatistics);
app.use("/verify", verify);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
  console.log("Server started on port " + port);
}
app.listen(port);

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

app.get("/", (req, res) => {
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

/**
 * Check for new headlines at interval and store new ones in db
 **/

setInterval(() => {
  getArticleOne();
}, 60000 * 60);

setInterval(() => {
  getArticleTwo();
}, 60000 * 120);
