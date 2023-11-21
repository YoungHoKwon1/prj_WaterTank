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
  manageId: String,
  address: String,
  rsvType: String,
  lvlDead: String,
  lvlHigh: String,
  lvlFlood: String,
  height: String,
  valQuan: String,
  senseP: String,
  senseC: String,
  lvlC: String,
  incharge: String,
  MAC: String,
  phone: String,
  commInterver: String,
  actuWait: String,
  actuTime: String,
});

module.exports = mongoose.model("Reservoir", ReservoirSchema);
