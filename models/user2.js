/*
Description: data schema for userData.ejs
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const User2Schema = new Schema({
  name: String,
  company: String,
  phone: String,
  address: String,

  userName: String,
  password: String,
  userType: String,
  incharge: String,
});

User2Schema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User2", User2Schema);
