// const createError = require("http-errors");
const axios = require("axios");
const fetch = require("node-fetch");

module.exports = async (req, res, next) => {
  if (process.env.LIMS_ACCESS_TOKEN) return next();

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
      return new Promise((resolve, reject) => {
        const originalReq = err.config;

        if (
          err.response.status === 401 &&
          err.config &&
          !err.config.__isRetryRequest
        ) {
          originalReq._retry = true;

          return fetch(
            "http://localhost:3030/lims/api/auth/refresh-token",

            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken: process.env.LIMS_REFRESH_TOKEN,
              }),
            }
          )
            .then((res) => res.json())
            .then((res) => {
              if (res.accessToken) {
                process.env.LIMS_ACCESS_TOKEN = res.accessToken;
                process.env.LIMS_REFRESH_TOKEN = res.refreshToken;
                originalReq.headers[
                  "Authorization"
                ] = `Bearer ${res.accessToken}`;
                console.log("****Refresh Token generated****");
                return resolve(axios(originalReq));
              } else if (res.error.status === 401) {
                return fetch("http://localhost:3030/lims/api/auth/login", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userid: process.env.KIOSK_INTERFACE_ID,
                    password: process.env.KIOSK_INTERFACE_KEY,
                  }),
                })
                  .then((res) => res.json())
                  .then((res) => {
                    process.env.LIMS_ACCESS_TOKEN = res.accessToken;
                    process.env.LIMS_REFRESH_TOKEN = res.refreshToken;

                    console.log("****Refresh Token generated****");

                    originalReq.headers[
                      "Authorization"
                    ] = `Bearer ${res.accessToken}`;
                    return resolve(axios(originalReq));
                  });
              }
            });
        }

        return Promise.reject(err);
      });
    }
  );
  try {
    const response = await axios.post(
      "http://localhost:3030/lims/api/auth/login",
      {
        userid: process.env.KIOSK_INTERFACE_ID,
        password: process.env.KIOSK_INTERFACE_KEY,
      }
    );
    // console.log(response.data);
    process.env.LIMS_ACCESS_TOKEN = response.data.accessToken;
    process.env.LIMS_REFRESH_TOKEN = response.data.refreshToken;
    console.log("****Token generated****");
    next();
  } catch (error) {
    next(error);
  }
};
