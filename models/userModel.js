const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "standard-user",
    required: true,
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
