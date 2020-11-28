const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const kioskSchema = new Schema({
  kioskId: {
    type: String,
    required: true,
  },
  rfreader: {
    type: mongoose.Types.ObjectId,
    ref: "Rfreader",
  },
  instruments: [
    {
      id: String,
      name: String,
      properties: [
        {
          name: String,
          display: false,
        },
      ],
    },
  ],
  samplesInTest: [
    {
      type: mongoose.Types.ObjectId,
      ref: "SampleTest",
    },
  ],
  created: { type: Date, default: Date.now },
  updated: Date,
});

module.exports = mongoose.model("Kiosk", kioskSchema);
