const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const { DUMMY_USERS } = require("../models/users-model");
const { JWT_SECRET } = require("../config/keys");
// const { CLIENT_INSTRUMENT_CONNECTION } = require("../models/instrument-model");

const io = require("../socket.js");

exports.getUserById = (req, res, next) => {
  const userId = req.params.uid;
  const kioskId = req.params.kid; //kiosk id
  const user = DUMMY_USERS.find((u) => u.id === userId); //Async code
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  io.getIO().in(kioskId).emit("jwttoken", { user: user.id });

  res.json({
    userId: user.id,
  });
};

exports.verifyUserPin = (req, res, next) => {
  const { userId, pin } = req.body;
  const user = DUMMY_USERS.find((u) => u.id === userId);
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }
  if (user.pin !== pin) {
    return next(new HttpError("Incorrect pin!", 422));
  }
  let token;
  try {
    token = jwt.sign(
      { email: user.email, userId: user.id, contact: user.contact },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Sign in failed", 500));
  }
  res.json({
    token: token,
    userId: user.id,
    isAuthenticated: true,
    email: user.email,
    contact: user.contact,
    username: user.username,
  });
};

exports.login = (req, res, next) => {
  const { username, password } = req.body;
  //Async code
  const user = DUMMY_USERS.find((u) => u.username === username);
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  if (user.password !== password) {
    return next(new HttpError("Incorrect password!", 422));
  }
  let token;
  try {
    token = jwt.sign(
      { email: user.email, userId: user.id, contact: user.contact },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Sign in failed", 500));
  }

  res.json({
    token: token,
    isAuthenticated: true,
    userId: user.id,
    email: user.email,
    contact: user.contact,
    username: user.username,
  });
};
