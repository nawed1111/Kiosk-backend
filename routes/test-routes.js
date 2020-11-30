const express = require("express");
const testController = require("../controllers/test-controller");

const CheckAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(CheckAuth);

router.get("/:kid/:sid", testController.getSampleById);

// router.get("/running/:tid", testController.getRunningTestById);

router.put("/run-test", testController.runSampleTest);

router.patch(
  "/post-sample-removal",
  testController.postSampleRemovalFromInstrument
);

module.exports = router;
