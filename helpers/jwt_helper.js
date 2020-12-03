const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const redisClient = require("./init_redis");

module.exports = {
  signAccessToken: (user) => {
    return new Promise((resolve, reject) => {
      const payload = {
        user,
      };
      const options = {
        expiresIn: `${process.env.JWT_ACCESS_TOKEN_LIFE}s`,
        issuer: process.env.JWT_ISSUER,
        audience: user.userId,
      };
      jwt.sign(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        options,
        (err, token) => {
          if (err) {
            console.log("signAccessToken method :: ", err.message);
            return reject(createError.InternalServerError());
          }
          return resolve(token);
        }
      );
    });
  },

  verifyAccessToken: (req) => {
    return new Promise((resolve, reject) => {
      const authHeader = req.headers["authorization"];
      if (!authHeader)
        return reject(createError.Unauthorized("Bearer token is missing"));
      const bearerToken = authHeader.split(" ");
      const token = bearerToken[1];

      jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
          console.log("verifyAccessToken method :: ", err.message);
          const message =
            err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
          return reject(createError.Unauthorized(message));
        }
        return resolve(payload.aud);
      });
    });
  },

  signRefreshAccessToken: (user) => {
    return new Promise((resolve, reject) => {
      const payload = {
        user,
      };

      const options = {
        expiresIn: `${process.env.JWT_REFRESH_TOKEN_LIFE}s`,
        issuer: process.env.JWT_ISSUER,
        audience: user.userId,
      };
      jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        options,
        (err, token) => {
          if (err) {
            console.log(err);
            return reject(createError.InternalServerError());
          }
          redisClient.SET(
            user.userId,
            token,
            "EX",
            process.env.JWT_REFRESH_TOKEN_LIFE,
            (err, reply) => {
              if (err) {
                console.log(
                  `Error storing refresh token in redis server... ${err.message}`
                );
                return reject(createError.InternalServerError());
              }
              return resolve(token);
            }
          );
        }
      );
    });
  },

  verifyRefreshAccessToken: (req) => {
    return new Promise((resolve, reject) => {
      const { refreshToken } = req.body;
      if (!refreshToken) return reject(createError.BadRequest());
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) {
            console.log("verifyRefreshAccessToken method :: ", err.message);
            return reject(createError.Unauthorized());
          }
          redisClient.GET(payload.aud, (error, result) => {
            if (error) {
              console.log(
                `Error during fetching details of ${payload.aud} key from redis...${error.message}`
              );
              return reject(createError.InternalServerError());
            }
            if (refreshToken === result) return resolve(payload.user);
            return reject(createError.Unauthorized());
          });
        }
      );
    });
  },

  deleteRefreshToken: (req) => {
    return new Promise((resolve, reject) => {
      const { refreshToken } = req.body;
      if (!refreshToken) return reject(createError.BadRequest());
      module.exports
        .verifyRefreshAccessToken(req)
        .then((user) => {
          redisClient.DEL(user.userId, (err, value) => {
            if (err) {
              console.log(err.message);
              return reject(createError.InternalServerError());
            }
            return resolve("success");
          });
        })
        .catch((error) => {
          console.log(error.message);
          return reject(error);
        });
    });
  },
};
