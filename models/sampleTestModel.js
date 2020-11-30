const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sampleTestSchema = new Schema({
  instrumentId: {
    type: String,
    required: true,
  },
  samples: [
    {
      id: String,
      name: String,
    },
  ],
  kiosk: {
    type: mongoose.Types.ObjectId,
    ref: "Kiosk",
  },
  duration: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  doneBy: {
    type: String,
    required: true,
  },
  doneOn: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("SampleTest", sampleTestSchema);
