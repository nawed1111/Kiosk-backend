const express = require("express");
const testController = require("../controllers/test-controller");

const CheckAuth = require("../middleware/check-auth");
const getLIMSToken = require("../middleware/get-LIMS-token");

const router = express.Router();

// router.get("/running/:tid", testController.getRunningTestById);

router.get("/:kid/:sid", getLIMSToken, testController.getSampleByIdFromLims);

router.use(CheckAuth);

router.put("/run-test", getLIMSToken, testController.runSampleTest);

router.patch(
  "/post-sample-removal",
  getLIMSToken,
  testController.postSampleRemovalFromInstrument
);

module.exports = router;
