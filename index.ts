import bcrypt from "bcrypt";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
import { getArticleOne } from "./functions/getArticleOne";
import { getArticleTwo } from "./functions/getArticleTwo";
import { User, IUser } from "./models/user";
import headlinesRouter from "./routes/headlines";
import homeRouter from "./routes/home";
import logoutRouter from "./routes/logout";
import loginRouter from "./routes/login";
import registerRouter from "./routes/register";
import settingsRouter from "./routes/settings";
import dashboardRouter from "./routes/dashboard";
import gameRouter from "./routes/game";
import verifyRouter from "./routes/verify";
import resetPasswordRouter from "./routes/resetPassword";
import forgotPasswordRouter from "./routes/forgotPassword";
import updateStatisticsRouter from "./routes/updateStatistics";

dotenv.config();

const app = express();
const inProd = process.env.NODE_ENV === "production";

if (inProd) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

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

app.use(
  session({
    name: "_Session",
    secret: process.env.SESSION_SECRET ?? "",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_CONNECTION_STRING,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: inProd,
      maxAge: 1000 * 60 * 60 * 24 * 14,
      domain: process.env.DOMAIN,
      path: "/",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many accounts created from this IP, please try again later." },
});

app.use("/login", authLimiter);
app.use("/forgotPassword", authLimiter);
app.use("/resetPassword", authLimiter);
app.use("/verify", authLimiter);
app.use("/register", registerLimiter);

app.use("/home", homeRouter);
app.use("/headlines", headlinesRouter);
app.use("/dashboard", dashboardRouter);
app.use("/forgotPassword", forgotPasswordRouter);
app.use("/game", gameRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/register", registerRouter);
app.use("/resetPassword", resetPasswordRouter);
app.use("/settings", settingsRouter);
app.use("/updateStatistics", updateStatisticsRouter);
app.use("/verify", verifyRouter);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    const u = user as unknown as IUser;
    return cb(null, {
      id: (u._id as { toString(): string }).toString(),
      username: u.name,
      email: u.email,
      email_verified: u.email_verified ?? false,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user as Express.User);
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
        const user = await User.findOne({ email });
        if (!user) return done(null, false);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false);
        return done(null, user as unknown as Express.User);
      } catch (error) {
        console.log(error);
        return done(error as Error, false);
      }
    }
  )
);

app.get("/", (req, res) => {
  return res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

let port: string | number = process.env.PORT ?? 3000;
if (port === "") {
  port = 3000;
  console.log("Server started on port " + String(port));
}
app.listen(port);

mongoose.connect(process.env.DATABASE_CONNECTION_STRING ?? "");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});

setInterval(() => {
  getArticleOne();
}, 60000 * 60);

setInterval(() => {
  getArticleTwo();
}, 60000 * 180);
