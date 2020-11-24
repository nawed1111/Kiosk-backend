require("dotenv").config();
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const { DUMMY_USERS } = require("../models/users-model");

const jwtSecretKeyForUsers = process.env.JWT_SECRET_USERS;

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, jwtSecretKeyForUsers);

    const user = DUMMY_USERS.find((u) => u.id === decodedToken.userId);
    if (!user) {
      return next(new HttpError("User not found!", 404));
    }
    req.user = user; //passing user to next
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
};
