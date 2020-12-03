const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

module.exports = async (req, res, next) => {
  // console.log("Token middle", process.env.LIMS_ACCESS_TOKEN);
  if (process.env.LIMS_ACCESS_TOKEN) return next();

  axios.interceptors.response.use(
    (res) => {
      console.log("interceptor: ");
      return res;
    },
    (err) => {
      if (err.response.status === 401) {
        console.log("JWT expired!");
      }
      throw err;
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
    next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
