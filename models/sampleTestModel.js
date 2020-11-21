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
    type: Schema.Types.ObjectId,
    ref: "Kiosk",
  },
  duration: Number,
  timestamp: Number,
  doneBy: String,
  doneOn: String,
});

module.exports = mongoose.model("SampleTest", sampleTestSchema);
