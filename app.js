// github test123
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Location = require("./models/location");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const catchAsync = require("./utils/catchAsync");
const User = require("./models/user");
const axios = require("axios");

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

const thingSpeak_KEY = "TJINH2I1U11WNSLU";
const thingSpeak_ID = "1395732";

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("__method"));
app.use(express.static(path.join(__dirname, "public")));

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

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", async (req, res) => {
  const response = await axios.get(
    `https://api.thingspeak.com/channels/${thingSpeak_ID}/feeds.json?api_key=${thingSpeak_KEY}`
  );
  const feeds = response.data.feeds;
  const locations = await Location.find();
  res.render("home", {
    feeds: feeds,
    locations: locations,
  });
});

app.get("/location/:id", async (req, res) => {
  const location = await Location.findById(req.params.id);
  res.render("location", { location });
});

app.delete("/location/:id", async (req, res) => {
  const { id } = req.params;
  if (!req.isAuthenticated()) {
    req.flash("error", "관리자 로그인 필요");
    res.redirect(`/location/${id}`);
  } else {
    await Location.findByIdAndDelete(id);
    res.send(
      "<script>window.opener.location.reload(); window.close();</script>"
    );
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/admin", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "관리자 로그인 필요");
    return res.redirect("/login");
  }
  res.render("admin");
});

app.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "회원가입 완료");
        res.redirect("/admin");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

app.post(
  "/admin",
  catchAsync(async (req, res) => {
    const { name, address, address2 } = req.body;
    const location = new Location({ name, address, address2 });
    await location.save();
    res.redirect("/");
  })
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    successFlash: true,
    successRedirect: "/",
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "로그아웃 중 오류가 발생했습니다.");
      return res.redirect("/");
    }
    req.flash("success", "로그아웃");
    res.redirect("/");
  });
});

app.get("/data", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "관리자 로그인 필요");
    return res.redirect("/login");
  }
  try {
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${thingSpeak_ID}/feeds.json?api_key=${thingSpeak_KEY}`
    );
    res.json(response.data.feeds);
  } catch (error) {
    console.error("Error fetching data from ThingSpeak:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
