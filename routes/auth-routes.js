const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth-controller");
const checkAuth = require("../middleware/check-auth");
const getLimsToken = require("../middleware/get-LIMS-token");
const roleRequired = require("../middleware/required-role");

const router = express.Router();

/***************Standard users*****************/

/**
 * @swagger
 *
 * /api/auth/{userid}/{kioskid}:
 *   get:
 *     description: Use to scan badge to login to kiosk application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: User Id
 *         in: path
 *         required: true
 *         type: string
 *       - name: kioskid
 *         description: Kiosk Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:uid/:kid", getLimsToken, authController.getUserByIdFromLIMS);

/**
 * @swagger
 *
 * /api/auth/verify-pin:
 *   post:
 *     description: Use for authentication of user's kiosk pin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: User id to use for login
 *         in: formData
 *         required: true
 *         type: string
 *       - name: pin
 *         description: User's pin
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       401:
 *         description: Unsuccessful authentication
 */
router.post(
  "/verify-pin",
  getLimsToken,
  authController.verifyUserPinFromKioskDB
);

/**
 * @swagger
 *
 * /api/auth/refresh-token:
 *   post:
 *     description: Use for refreshing access token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: refreshToken
 *         description: Refresh token issued to customer/user
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Token successfully refreshed and new pair of access/refresh token issued
 *       401:
 *         description: Unsuccessful authentication
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @swagger
 *
 * /api/auth/logout:
 *   delete:
 *     description: Use for closing the session and tokens
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: refreshToken
 *         description: Refresh token issued to customer/user
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       204:
 *         description: Successfully logged-out and token is deactivated
 *       401:
 *         description: Unsuccessful authentication
 */
router.delete("/logout", authController.logout);

/**
 * @swagger
 *
 * /api/auth/update-user/{uid}:
 *   patch:
 *     description: Use for updating user's kiosk pin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: uid
 *         description: User id to use for login
 *         in: path
 *         required: true
 *         type: string
 *       - name: pin
 *         description: User's pin
 *         in: formData
 *         required: true
 *         type: string
 *       - name: confirmPin
 *         description: User's pin
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully updated
 *       401:
 *         description: Unsuccessful authentication
 */
router.patch(
  "/update-user/:uid",
  [
    check("pin").notEmpty().isLength({ min: 4 }).isNumeric(),
    check("confirmPin").notEmpty().isLength({ min: 4 }).isNumeric(),
  ],
  authController.updateUserInKioskDB
);

/***************Admin*****************/

/**
 * @swagger
 *
 * /api/auth/admin/login:
 *   post:
 *     description: Use for authentication of admin users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: Kiosk Administrator User Id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: Password of Kiosk Administrator
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated and acess/refresh tokesn issued
 *       401:
 *         description: Unsuccessful authentication
 */
router.post("/admin/login", authController.adminLogin);

router.use(checkAuth);

/**
 * @swagger
 *
 * /api/auth/admin/{userid}:
 *   get:
 *     description: Use for getting administrator user details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: Kiosk Administrator User Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved kiosk admin user information
 *       401:
 *         description: Unsuccessful authentication
 */
router.get("/admin/:userid", authController.getOneAdmin);

/**
 * @swagger
 *
 * /api/auth/admin:
 *   post:
 *     description: Use for creating kiosk administrator user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: User id to use for login
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password
 *         in: formData
 *         required: true
 *         type: string
 *       - name: fname
 *         description: First Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: lname
 *         description: Last Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: role
 *         description: User's Role
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: User's email id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: countrycode
 *         description: Country Code (Mobile Number)
 *         in: formData
 *         required: false
 *         type: number
 *       - name: mobno
 *         description: Mobile Number
 *         in: formData
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: Successfully created admin user
 *       401:
 *         description: Unsuccessful authentication
 */
router.post("/admin", authController.createAdminInKioskDB);

/**
 * @swagger
 *
 * /api/auth/admin/{userid}:
 *   patch:
 *     description: Use for getting administrator user details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: Kiosk Administrator User Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully updated kiosk admin user information
 *       401:
 *         description: Unsuccessful authentication
 */
router.patch("/admin/:userid", authController.updateAdmin);

/**
 * @swagger
 *
 * /api/auth/admin-list:
 *   get:
 *     description: Use for getting details of all kiosk administrators
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved kiosk admin user information
 *       401:
 *         description: Unsuccessful authentication
 */
router.get(
  "/admin-list",
  roleRequired("admin"),
  authController.getAdminListFromKioskDB
);

module.exports = router;
