/*
Description: data schema for reservoirData.ejs
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
rsv: resorvoid
lvl: water level
valQuan: valid Quantity
senseP: sensing Pressure
senseC: sensing Correction
lvlC: water level Correction
actu: actuator
*/
const ReservoirSchema = new Schema({
  name: String,
  manageId: Number,
  address: String,
  rsvType: String,

  lvlDead: Number,
  lvlHigh: Number,
  lvlFlood: Number,
  height: Number,

  valQuan: Number,
  senseP: Number,
  senseC: Number,
  lvlC: Number,

  incharge: String,
  MAC: String,
  phone: Number,
  commInterver: Number,

  actuWait: Number,
  actuTime: Number,
});

module.exports = mongoose.model("Reservoir", ReservoirSchema);
