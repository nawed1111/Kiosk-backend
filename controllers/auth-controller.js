require("dotenv").config();
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const { DUMMY_USERS } = require("../models/users-model");

const jwtSecretKey = process.env.JWT_SECRET_USERS;
// const jwtSecretKeyForAdmin = process.env.JWT_SECRET_ADMIN;

const io = require("../util/socket");

exports.getUserById = (req, res, next) => {
  const userId = req.params.uid;
  const kioskId = req.params.kid; //kiosk id
  const user = DUMMY_USERS.find((u) => u.id === userId); //Async code
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  io.getIO().in(kioskId).emit("jwttoken", { user: user.id });

  res.json({
    userId: user.id,
  });
};

exports.getUsers = (req, res, next) => {
  const users = DUMMY_USERS.map((user) => {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      contact: user.contact,
      role: user.role,
    };
  });

  res.status(200).json({ message: "Fetched users sucessfully", users });
};

exports.verifyUserPin = (req, res, next) => {
  const { userId, pin } = req.body;
  const user = DUMMY_USERS.find((u) => u.id === userId);
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }
  if (user.pin !== pin) {
    return next(new HttpError("Incorrect pin!", 422));
  }
  let token;
  try {
    token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          contact: user.contact,
          username: user.username,
          role: user.role,
        },
      },
      jwtSecretKey,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Sign in failed", 500));
  }
  res.json({
    token: token,
    user: {
      userId: user.id,
      email: user.email,
      contact: user.contact,
      username: user.username,
    },
  });
};

exports.login = (req, res, next) => {
  const { username, password } = req.body;
  //Async code
  const user = DUMMY_USERS.find((u) => u.username === username);
  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  if (user.password !== password) {
    return next(new HttpError("Incorrect password!", 422));
  }
  let token;
  // let secretKey;
  // if (user.role === "admin") secretKey = jwtSecretKeyForAdmin;
  // if (user.role === "standard-user") secretKey = jwtSecretKeyForUsers;

  try {
    token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          contact: user.contact,
          username: user.username,
          role: user.role,
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

  res.json({ token });
};
