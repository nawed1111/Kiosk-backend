const HttpError = require("../models/http-error");

module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role === requiredRole) {
      return next();
    } else {
      return next(new HttpError("Action not permitted!", 401));
    }
  };
};
