require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const app = express();
const date = new Date();

app.use(express.static("public"));
app.use(
  session({
    secret: "keyboard cat",
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
  date_joined: String,
  lastLogin: Date,
  headlines: {
    headline_id: double,
    publication: String,
    chose_correctly: Boolean,
    democrat_republican: String,
    inflammatory_rating: Integer,
  },
});

const headlineSchema = new mongoose.Schema({
  headline: String,
  photo_url: String,
  photo_source_url: String,
  publish_date: Date,
  publication: String,
  article_url: String,
  times_correctly_chosen: Integer,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
headlineSchema.plugin(passportLocalMongoose);
headlineSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Headline = new mongoose.model("Headline", headlineSchema);

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
