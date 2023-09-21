const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Jeosooji = require("./models/jeosooji");
const router = express.Router();

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

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/admin", (req, res) => {
  // res.redirect("/login");
  res.render("admin");
});

app.post("/", async (req, res) => {
  res.send(req.body);
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
