const jwt = require("jsonwebtoken");
const { verifyAccessToken } = require("../helpers/jwt_helper");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const user = await verifyAccessToken(req);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
