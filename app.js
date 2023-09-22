const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Jeosooji = require("./models/jeosooji");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const catchAsync = require("./utils/catchAsync");
const User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/jeosooji", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionConfig = {
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "login",
  }),
  (req, res) => {
    req.flash("success", "로그인");
    res.redirect("/admin");
  }
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/admin", (req, res) => {
  // res.redirect("/login");
  res.render("admin");
});

app.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.flash("success", "회원가입 완료");
      res.redirect("/admin");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

app.listen(3000, () => {
  console.log("serving on port 3000");
});
