require("dotenv").config();
const axios = require("axios");

const authToken = process.env.AUTH_TOKEN_D7;

const sendSMS = (phone, message) => {
  const options = {
    method: "POST",
    url: "https://rest-api.d7networks.com/secure/send",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authToken,
    },
    data: {
      to: phone,
      content: message,
      from: "SMSINFO",
    },
  };
  axios(options)
    .then((res) => {
      console.log("SMS Sent to", phone);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

module.exports = sendSMS;
