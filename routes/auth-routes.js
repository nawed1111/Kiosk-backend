const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth-controller");
const checkAuth = require("../middleware/check-auth");
const getLimsToken = require("../middleware/get-LIMS-token");
const roleRequired = require("../middleware/required-role");

const router = express.Router();

/***************Standard users*****************/

router.get("/:uid/:kid", getLimsToken, authController.getUserByIdFromLIMS);
router.post(
  "/verify-pin",
  getLimsToken,
  authController.verifyUserPinFromKioskDB
);
router.post("/refresh-token", authController.refreshToken);
router.delete("/logout", authController.logout);

router.patch(
  "/update-user/:uid",
  [
    check("pin").notEmpty().isLength({ min: 4 }).isNumeric(),
    check("confirmPin").notEmpty().isLength({ min: 4 }).isNumeric(),
  ],
  authController.updateUserInKioskDB
);

/***************Admin*****************/

router.post("/admin/login", authController.adminLogin);

router.use(checkAuth);

router.get("/admin/:userid", authController.getOneAdmin);

router.post("/admin/:userid", authController.createAdminInKioskDB);

router.patch("/admin/:userid", authController.updateAdmin);

router.get(
  "/admin-list",
  roleRequired("admin"),
  authController.getAdminListFromKioskDB
);

module.exports = router;
