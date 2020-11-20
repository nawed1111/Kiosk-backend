const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const rfreaderSchema = new Schema({
  rfid: {
    type: String,
    required: true,
  },
  kioskId: {
    type: Schema.Types.ObjectId,
    ref: "Kiosk",
  },
});

module.exports = mongoose.model("Rfreader", rfreaderSchema);
