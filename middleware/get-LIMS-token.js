const axios = require("axios");
const fetch = require("node-fetch");

const {
  storeLimsTokeninRedis,
  getLimsTokenFromRedis,
  generateLimsToken,
} = require("../helpers/jwt_helper");

module.exports = async (req, res, next) => {
  const userid = process.env.KIOSK_INTERFACE_ID;

  axios.interceptors.response.use(
    (response) => {
      return new Promise((resolve, reject) => {
        resolve(response);
      });
    },
    (err) => {
      if (!err.response)
        return new Promise((resolve, reject) => {
          reject(err);
        });
      return new Promise(async (resolve, reject) => {
        const originalReq = err.config;

        if (
          err.response.status === 401 &&
          err.config &&
          !err.config.__isRetryRequest
        ) {
          originalReq._retry = true;

          let refreshToken;
          try {
            refreshToken = await getLimsTokenFromRedis(
              `Refresh.Token.${userid}`
            );
          } catch (err) {
            console.log(err);
          }

          return fetch(
            "http://localhost:3030/lims/api/auth/refresh-token",

            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken,
              }),
            }
          )
            .then((res) => res.json())
            .then(async (res) => {
              if (res.error && res.error.status === 401) {
                const token = await generateLimsToken();
                originalReq.headers["Authorization"] = `Bearer ${token}`;
                return resolve(axios(originalReq));
              }
              await storeLimsTokeninRedis({
                aud: `Access.Token.${userid}`,
                token: res.accessToken,
              });

              await storeLimsTokeninRedis({
                aud: `Refresh.Token.${userid}`,
                token: res.refreshToken,
              });

              originalReq.headers[
                "Authorization"
              ] = `Bearer ${res.accessToken}`;
              console.log("****LIMS Token generated using Refresh Token****");
              return resolve(axios(originalReq));
            });
        }

        return Promise.reject(err);
      });
    }
  );

  getLimsTokenFromRedis(`Access.Token.${userid}`)
    .then(async (token) => {
      if (token) {
        req.token = token;
        return next();
      }
      token = await generateLimsToken();
      req.token = token;
      next();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
