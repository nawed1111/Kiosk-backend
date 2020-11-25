require("dotenv").config();
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

const jwtSecretKey = process.env.JWT_SECRET_USERS;

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, jwtSecretKey);

    req.user = decodedToken.user; //passing user to next
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
};
