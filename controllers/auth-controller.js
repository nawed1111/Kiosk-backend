const bcrypt = require("bcrypt");
const axios = require("axios");
const { validationResult } = require("express-validator");
const createError = require("http-errors");
const {
  signAccessToken,
  signRefreshAccessToken,
  verifyRefreshAccessToken,
  deleteRefreshToken,
} = require("../helpers/jwt_helper");

const {
  adminSchema,
  loginSchema,
} = require("../helpers/schema-validation/adminSchemaValidation");

const HttpError = require("../models/http-error");

const User = require("../models/userModel");
const Admin = require("../models/adminModel");

const io = require("../util/socket");

exports.getUserByIdFromLIMS = async (req, res, next) => {
  const userid = req.params.uid;
  const kioskId = req.params.kid;

  let existingUser;
  try {
    existingUser = await User.findOne({ userid });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Fetching user failed", 500));
  }
  if (existingUser) {
    if (!existingUser.firstTimeLogin) {
      io.getIO().in(kioskId).emit("jwttoken", { userid, displayPin: true });
    } else {
      io.getIO().in(kioskId).emit("jwttoken", { userid, setupPin: true });
    }
    return res.json({ message: "Existing user" });
  }
  try {
    /**************API call to LIMS****************/

    const response = await axios.get(
      `${process.env.LIMS_API_BASEURL}/lims/api/users/${userid}`,
      {
        headers: {
          Authorization: "Bearer " + req.token,
        },
      }
    );

    if (response.status !== 200)
      return next(new HttpError("Could not find user", response.status));
    /**************API call to LIMS*****************/

    const user = response.data;

    if (!user) {
      return next(new HttpError("User not found!", response.status));
    }

    const newUser = new User({
      userid,
      name: `${user.fname} ${user.lname}`,
      firstTimeLogin: true,
      locked: false,
      updated: new Date(),
      createdBy: userid,
    });

    try {
      await newUser.save();
    } catch (error) {
      console.log(error);
      return next(new HttpError("Something went wrong!", 500));
    }

    io.getIO().in(kioskId).emit("jwttoken", { userid, setupPin: true });

    res.json({
      message: "User fetched successfully",
      userId: user.userid,
    });
  } catch (error) {
    return next(new HttpError("Could not find user", 404));
  }
};

/*
exports.loginFromLIMS = async (req, res, next) => {
  const { username, password } = req.body;
  
  //Check for user in LIMS database. API call to LIMS DB. 
  
  const user = DUMMY_USERS.find((u) => u.username === username);
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  if (user.password !== password) {
    return next(new HttpError("Incorrect password!", 422));
  }

  const userId = user.id;

  let existingUser;
  try {
    existingUser = await User.findOne({ userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Could not fetch user from DB", 500));
  }
  let role;
  if (existingUser) role = existingUser.role;

  let token;
  try {
    token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          contact: user.contact,
          username: user.username,
          role: role || "standard-user",
        },
      },
      jwtSecretKey,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(new HttpError("Sign in failed", 500));
  }

  if (!existingUser) {
    const newUser = new User({
      userId,
      username: user.username,
      firstTimeLogin: true,
      role: "standard-user",
      updated: new Date(),
      createdBy: user.username,
    });

    try {
      await newUser.save();
    } catch (error) {
      console.log(error);
      return next(new HttpError("Something went wrong!", 500));
    }
    res.json({ message: "Set up user pin", token, setupPin: true });
  } else if (existingUser.firstTimeLogin) {
    res.json({ message: "Set up user pin", token, setupPin: true });
  } else {
    res.json({ message: "Signed in successfully", token });
  }
};

*/

exports.verifyUserPinFromKioskDB = async (req, res, next) => {
  const { userid, pin } = req.body;

  try {
    const existingUser = await User.findOne({ userid });
    if (!existingUser) {
      throw createError.NotFound(`User ${userid} is not registered`);
    }

    const isEqual = await bcrypt.compare(pin, existingUser.pin);
    if (!isEqual) {
      throw createError.Unauthorized("Username/Password not valid");
    }
  } catch (error) {
    return next(error);
  }

  /**************API call to LIMS*************
   * for user details
   * ***/

  try {
    const response = await axios.get(
      `${process.env.LIMS_API_BASEURL}/lims/api/users/${userid}`,
      {
        headers: {
          Authorization: "Bearer " + req.token,
        },
      }
    );

    if (response.status !== 200)
      return next(new HttpError("Could not find user", response.status));

    const userDetails = response.data;

    user = {
      userid,
      email: userDetails.email,
      contact: `${userDetails.countrycode} ${userDetails.mobno}`,
      name: `${userDetails.fname} ${userDetails.lname}`,
      role: "standard-user",
    };
    /**************API call to LIMS****************/

    const accessToken = await signAccessToken(user);

    const refreshToken = await signRefreshAccessToken(user);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updateUserInKioskDB = async (req, res, next) => {
  const userid = req.params.uid;
  const { pin, confirmPin } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty() || pin !== confirmPin) {
    console.log(errors);
    return next(new HttpError("Invalid inputs passed!", 422));
  }

  try {
    const user = await User.findOne({ userid });

    if (!user) {
      return next(new HttpError("User does not exist!", 500));
    }

    const hashedPin = await bcrypt.hash(pin, 12);

    if (user.firstTimeLogin) {
      user.pin = hashedPin;
      user.firstTimeLogin = false;

      await user.save();

      return res.json({ message: "User updated successfully in kiosk DB" });
    }
    res.json({ message: "pin has already been set up" });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Fetching user failed", 500));
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const user = await verifyRefreshAccessToken(req);

    const newAccessToken = await signAccessToken(user);

    const newRefreshToken = await signRefreshAccessToken(user);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const output = await deleteRefreshToken(req);
    if (output === "success")
      res.status(204).json({ message: "Refresh Token deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.createAdminInKioskDB = async (req, res, next) => {
  try {
    const result = await adminSchema.validateAsync(req.body);
    const adminDoesExists = await Admin.findOne({ userid: result.userid });
    if (adminDoesExists)
      throw createError.Conflict(
        `Account for ${result.userid} already exists.`
      );

    const newAdmin = await new Admin(result).save();

    res.json({ message: "Created Successfully", newAdmin });
  } catch (error) {
    if (error.isJoi) error.status = 422;
    console.log(error);
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const user = await Admin.findOne({ userid: result.userid });
    if (!user)
      throw createError.NotFound(`User ${result.userid} is not registered`);
    const isMatched = await user.isValidPassword(result.password);
    if (!isMatched)
      throw createError.Unauthorized("Username/Password not valid");

    const accessToken = await signAccessToken(user);
    const refreshToken = await signRefreshAccessToken(user);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi) next(createError.BadRequest("Invalid Username/Password"));
    next(error);
  }
};

exports.getOneAdmin = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const doesExists = await Admin.findOne({ userid }).select(
      "-password -_id -__v"
    );
    if (!doesExists) throw createError.NotFound();
    res.json(doesExists);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
exports.getAdminListFromKioskDB = async (req, res, next) => {
  try {
    const users = await Admin.find().select("-_id -__v");
    res.json({ users });
  } catch (error) {
    error.message = "Internal Server Error";
    next(error);
  }
};

exports.updateAdmin = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const result = await adminSchema.validateAsync(req.body);
    const updatedAdmin = await Admin.findOneAndUpdate({ userid }, result, {
      returnOriginal: false,
    });
    if (!updatedAdmin) throw createError.NotFound(`${userid} is invalid user`);
    res.json({ message: `${userid} has been updated successfully` });
  } catch (error) {
    if (error.isJoi) error.status = 422;
    next(error);
  }
};
