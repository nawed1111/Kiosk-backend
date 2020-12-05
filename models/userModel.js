const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "standard-user",
  },
  pin: {
    type: String,
  },
  firstTimeLogin: {
    type: Boolean,
    default: true,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  created: { type: Date, default: Date.now },
  updated: Date,
  createdBy: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
