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
  kioskId: {
    type: Schema.Types.ObjectId,
    ref: "Kiosk",
  },
  duration: Number,
  timeStamp: Date,
  doneBy: String,
});

module.exports = mongoose.model("SampleTest", sampleTestSchema);
