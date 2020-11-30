require("dotenv").config();
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const { DUMMY_USERS } = require("../models/users-model-LIMS");
const User = require("../models/userModel");

const jwtSecretKey = process.env.JWT_SECRET_USERS;
// const jwtSecretKeyForAdmin = process.env.JWT_SECRET_ADMIN;

const io = require("../util/socket");

exports.getUserByIdFromLIMS = async (req, res, next) => {
  const userId = req.params.uid;
  const kioskId = req.params.kid; //kiosk id
  const user = DUMMY_USERS.find((u) => u.id === userId); //Async code
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  let existingUser;

  try {
    existingUser = await User.findOne({ userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Fetching user failed", 500));
  }

  if (existingUser && !existingUser.firstTimeLogin) {
    io.getIO()
      .in(kioskId)
      .emit("jwttoken", { userId: user.id, displayPin: true });
  } else {
    io.getIO()
      .in(kioskId)
      .emit("jwttoken", { userId: user.id, setupPin: true });
  }

  res.json({
    message: "User fetched successfully",
    userId: user.id,
  });
};

exports.loginFromLIMS = async (req, res, next) => {
  const { username, password } = req.body;

  /*
  Check for user in LIMS database. API call to LIMS DB. 
  */
  const user = DUMMY_USERS.find((u) => u.username === username);
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  if (user.password !== password) {
    return next(new HttpError("Incorrect password!", 422));
  }

  /*
    if user has passed above validation. We will check in Kiosk DB with the userId if user
    exists and and is not first time login. For the first timers, need to set up pin (since user is
    alreday authenticated we won't ask them to sign in again here but in case of
    id card scan user will have to login with credentials first).
  */
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

  if (!existingUser || existingUser.firstTimeLogin) {
    res.json({ message: "Set up user pin", token, setupPin: true });
  } else {
    res.json({ message: "Signed in successfully", token });
  }
};

exports.getUsersFromKioskDB = async (req, res, next) => {
  let users;
  try {
    users = await User.find().lean();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Could not fetch users", 500));
  }

  res.status(200).json({ message: "Fetched users sucessfully", users });
};

exports.verifyUserPinFromKioskDB = async (req, res, next) => {
  const { userId, pin } = req.body;
  let user;
  try {
    user = await User.findOne({ userId });
    if (!user) {
      return next(new HttpError("User not found!", 404));
    }
    const isEqual = await bcrypt.compare(pin, user.pin);
    if (!isEqual) {
      return next(new HttpError("Incorrect pin!", 422));
    }
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong", 500));
  }

  /**************API call to LIMS****************/

  const userDetails = DUMMY_USERS.find((u) => u.id === userId); //Async code
  if (!userDetails) {
    return next(new HttpError("User not found!", 404));
  }

  /**************API call to LIMS****************/

  let token;
  try {
    token = jwt.sign(
      {
        user: {
          userId,
          email: userDetails.email,
          contact: userDetails.contact,
          username: userDetails.username,
          role: user.role,
        },
      },
      jwtSecretKey,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Token could not be generated", 500));
  }
  res.json({
    message: "Signed in successfully",
    token: token,
  });
};

exports.createUserInKioskDB = async (req, res, next) => {
  const { pin, confirmPin } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty() || pin !== confirmPin) {
    console.log(errors);
    return next(new HttpError("Invalid inputs passed!", 422));
  }

  const userId = req.user.userId;
  let existingUser;

  try {
    existingUser = await User.findOne({ userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Fetching user failed", 500));
  }

  if (existingUser && !existingUser.firstTimeLogin) {
    return next(
      new HttpError("User already exists and pin has alreday been set up", 500)
    );
  }

  let hashedPin;
  try {
    hashedPin = await bcrypt.hash(pin, 12);
  } catch (error) {
    return next(new HttpError("Pin hashing failed", 500));
  }

  if (existingUser && existingUser.firstTimeLogin) {
    existingUser.pin = hashedPin;
    existingUser.firstTimeLogin = false;
    try {
      await existingUser.save();
      return res.json({ message: "User updated successfully in kiosk DB" });
    } catch (error) {
      return next(new HttpError("pin could not be saved", 500));
    }
  }
  const newUser = new User({
    userId,
    pin: hashedPin,
    firstTimeLogin: false,
    updated: new Date(),
    createdBy: req.user.username,
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong!", 500));
  }

  res.json({ message: "User created successfully in kiosk DB" });
};
