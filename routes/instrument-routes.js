const express = require("express");
const checkAuth = require("../middleware/check-auth");
const getLIMSToken = require("../middleware/get-LIMS-token");

const instrumentController = require("../controllers/instrument-controller");

const router = express.Router();

router.use(checkAuth);

/**
 * @swagger
 *
 * /api/instruments/instrument/{iid}:
 *   get:
 *     description: Use to get details of one LIMS instrument
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: iid
 *         description: LIMS Instrument Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved details of one LIMS instrument
 */
router.get(
  "/instrument/:iid",
  getLIMSToken,
  instrumentController.getInstrumentFromLIMS
);
// router.post(
//   "/instrument/:iid",
//   getLIMSToken,
//   instrumentController.getSelectedPropertiesOfInstrumentFromLIMS
// );

/**
 * @swagger
 *
 * /api/instruments/{kid}:
 *   get:
 *     description: Use to get details of all instruments connected with a Kiosk
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
 *         description: Successfully retrieved details of all instruments associated with Kiosk
 */
router.get("/:kid", getLIMSToken, instrumentController.getInstruments);

module.exports = router;
