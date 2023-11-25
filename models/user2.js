/*
Description: data schema for userData.ejs
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const passportLocalMongoose = require("passport-local-mongoose");

const User2Schema = new Schema({
  inputName: String,
  inputCompany: String,
  inputPhone: String,
  inputAddress: String,

  inputUserName: String,
  inputPassword: String,
  selectUserType: String,
  inchargedReservoir: String,
});

// User2Schema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User2", User2Schema);
