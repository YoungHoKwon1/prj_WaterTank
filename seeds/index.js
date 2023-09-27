const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Location = require("../models/location");

mongoose.connect("mongodb://localhost:27017/jeosooji", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

seedDB();
