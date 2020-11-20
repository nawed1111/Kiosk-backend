const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instrumentSchema = new Schema({
  id: String,
  name: String,
  description: String,
  loaded: {
    type: Boolean,
    default: false,
  },
  recommendedTemperature: Number,
});

module.exports = mongoose.model("Instruments", instrumentSchema);
