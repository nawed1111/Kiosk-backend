const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const kioskSchema = new Schema({
  kioskId: {
    type: String,
    required: true,
  },
  rfreader: {
    type: String,
  },
  instruments: [
    {
      _id: false,
      instrumentid: String,
      name: String,
      properties: [
        {
          _id: false,
          name: String,
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
