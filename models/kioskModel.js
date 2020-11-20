const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const kioskSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  rfreader: {
    type: Schema.Types.ObjectId,
    ref: "Rfreader",
  },
  instruments: [
    {
      id: String,
      name: String,
      filled: Boolean,
    },
  ],
  updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Kiosk", kioskSchema);
