const express = require("express");
const authController = require("../controllers/auth-controller");

const router = express.Router();

router.get("/:uid/:kid", authController.getUserById);
router.post("/verify-pin", authController.verifyUserPin);
router.post("/login", authController.login);

module.exports = router;
