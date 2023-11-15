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
    manageId: int,
    address: String,
    rsvType: String,

    lvlDead: float,
    lvlHigh: float,
    lvlFlood: float,
    height: float,

    valQuan: float,
    senseP: float,
    senseC: float,
    lvlC: float,

    incharge: String,
    MAC: String,
    phone: int,
    commInterver: int,

    actuWait: int,
    actuTime: int,
});

module.exports = mongoose.model("Location", ReservoirSchema);
