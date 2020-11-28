const express = require("express");
const authController = require("../controllers/auth-controller");
const checkAuth = require("../middleware/check-auth");
const roleRequired = require("../middleware/required-role");

const router = express.Router();

router.get("/:uid/:kid", authController.getUserById);
router.post("/verify-pin", authController.verifyUserPin);
router.post("/login", authController.login);

router.get("/users", checkAuth, roleRequired("admin"), authController.getUsers);

module.exports = router;
