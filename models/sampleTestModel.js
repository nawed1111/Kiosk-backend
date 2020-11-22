const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sampleTestSchema = new Schema({
  instrumentId: String,
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
  status: String,
  duration: Number,
  timestamp: Number,
  doneBy: String,
  doneOn: String,
});

module.exports = mongoose.model("SampleTest", sampleTestSchema);
