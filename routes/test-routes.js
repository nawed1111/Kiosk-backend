const express = require("express");
const testController = require("../controllers/test-controller");

const CheckAuth = require("../middleware/check-auth");
const getLIMSToken = require("../middleware/get-LIMS-token");

const router = express.Router();

// router.get("/running/:tid", testController.getRunningTestById);

/**
 * @swagger
 *
 * /api/test/{kid}/{sid}:
 *   get:
 *     description: Use to scan a sample in a kiosk (and to get sample information from LIMS)
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: kid
 *         description: Kiosk Id
 *         in: path
 *         required: true
 *         type: string
 *       - name: sid
 *         description: Sample Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved details of a sample from LIMS and emitted scanned sample event through socket
 */
router.get("/:kid/:sid", getLIMSToken, testController.getSampleByIdFromLims);

router.use(CheckAuth);

/**
 * @swagger
 *
 * /api/test/run-test:
 *   put:
 *     description: Use for putting samples in a intrument
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: instrumentId
 *         description: Instrument Id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: samples
 *         description: Sample Ids
 *         in: formData
 *         required: true
 *         type: string
 *       - name: kioskId
 *         description: Kiosk Id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: duration
 *         description: Time Duration
 *         in: formData
 *         required: true
 *         type: string
 *       - name: timestamp
 *         description: Timestamp (when samples are kept in instrument)
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Samples are succesfully placed in instrument
 *       401:
 *         description: Unsuccessful authentication
 */
router.put("/run-test", getLIMSToken, testController.runSampleTest);

/**
 * @swagger
 *
 * /api/test/post-sample-removal:
 *   patch:
 *     description: Use for taking out samples from a intrument
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: testId
 *         description: Test Id
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Samples are succesfully taken out from instrument
 *       401:
 *         description: Unsuccessful authentication
 */
router.patch(
  "/post-sample-removal",
  getLIMSToken,
  testController.postSampleRemovalFromInstrument
);

module.exports = router;
