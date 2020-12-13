const express = require("express");

const kioskController = require("../controllers/kiosk-controller");
const roleRequired = require("../middleware/required-role");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

/**
 * @swagger
 *
 * /api/kiosks:
 *   get:
 *     description: Use to get kiosk information
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: page
 *         description: Total number of pages
 *         in: query
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved details of all kiosks
 */
router.get("/", checkAuth, roleRequired("admin"), kioskController.getKiosks);

/**
 * @swagger
 *
 * /api/kiosks/{kid}:
 *   get:
 *     description: Use to get details of one kiosk
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: kid
 *         description: Kiosk Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved details of a kiosk
 */
router.get("/:kid", kioskController.getKioskById);

router.use(checkAuth);

/**
 * @swagger
 *
 * /api/kiosks:
 *   post:
 *     description: Use to register a new kiosk
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: kioskId
 *         description: Kiosk Id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: instruments
 *         description: Instrument Id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: rfreader
 *         description: RFID Readed
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Kiosk successfully created
 *       401:
 *         description: Unsuccessful authentication
 */
router.post("/", roleRequired("admin"), kioskController.createKiosk);

/**
 * @swagger
 *
 * /api/kiosks/{kid}:
 *   patch:
 *     description: Use to update a kiosk
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: kid
 *         description: Kiosk Id
 *         in: path
 *         required: true
 *         type: string
 *       - name: instruments
 *         description: Instrument Id
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Kiosk successfully updated
 *       401:
 *         description: Unsuccessful authentication
 */
router.patch("/:kid", roleRequired("admin"), kioskController.updateKiosk);

/**
 * @swagger
 *
 * /api/kiosks/{kid}:
 *   delete:
 *     description: Use to delete a kiosk
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: kid
 *         description: Kiosk Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Kiosk successfully deleted
 *       401:
 *         description: Unsuccessful authentication
 */
router.delete("/:kid", roleRequired("admin"), kioskController.deleteKiosk);

module.exports = router;
