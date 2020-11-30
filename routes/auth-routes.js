const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth-controller");
const checkAuth = require("../middleware/check-auth");
const roleRequired = require("../middleware/required-role");

const router = express.Router();

router.get("/:uid/:kid", authController.getUserByIdFromLIMS);
router.post("/verify-pin", authController.verifyUserPinFromKioskDB);
router.post("/login", authController.loginFromLIMS);

router.use(checkAuth);

router.put(
  "/create-user",
  [
    check("pin").notEmpty().isLength({ min: 4 }).isNumeric(),
    check("confirmPin").notEmpty().isLength({ min: 4 }).isNumeric(),
  ],
  authController.createUserInKioskDB
);

router.get("/users", roleRequired("admin"), authController.getUsersFromKioskDB);

module.exports = router;
