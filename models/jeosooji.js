const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JeosoojiSchema = new Schema({
  name: String, // 지점이름
  yesterdayWaterReserveRate: Number, //전일 저수율
  todayWaterReserveRate: Number, //금일 저수율
  currentStorageLevel: Number, //현수위
  fullStorageLevel: Number, //만수위
  deadStorageLevel: Number, //사수위
  jeJungGo: Number, //제정고
  floodStorageLevel: Number, //홍수위
  totalWaterStorage: Number, //총저수량
  effectiveWaterStorage: Number, //유효저수량
  location: String, //소재지
  jurisdiction: String, //관할지사
  yesterday: String, //어제 기준일시
  yesterdayQuantity: String, //어제 저수량
  yesterdayLevel: String, //어제 저수위
  today: String, //오늘 기준일시
  todayQuantity: String, //오늘 저수량
  todayLevel: String, //오늘 저수위
});

module.exports = mongoose.model("jeosooji", JeosoojiSchema);
