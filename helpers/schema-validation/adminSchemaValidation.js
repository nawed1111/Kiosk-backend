const joi = require("joi");

const adminSchema = joi.object({
  userid: joi.string().required(),
  password: joi.string().required().min(8),
  fname: joi.string().required(),
  lname: joi.string().required(),
  role: joi.string().required(),
  email: joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
  countrycode: joi.number(),
  mobno: joi.number(),
});

const loginSchema = joi.object({
  userid: joi.string().required(),
  password: joi.string().required().min(4),
});

module.exports = {
  adminSchema,
  loginSchema,
};
