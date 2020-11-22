require("dotenv").config();
const request = require("request");

const authToken = process.env.AUTH_TOKEN_D7;

const sendSMS = async (phone, message) => {
  var options = {
    method: "POST",
    url: "https://rest-api.d7networks.com/secure/send",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authToken,
    },
    body: JSON.stringify({
      to: phone,
      content: message,
      from: "SMSINFO",
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log("SMS sent");
  });
};

module.exports = sendSMS;
