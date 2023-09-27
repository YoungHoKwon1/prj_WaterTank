const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  name: String,
  address: String,
  address2: String,
});

module.exports = mongoose.model("Location", LocationSchema);
