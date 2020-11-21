const express = require("express");
const samplesController = require("../controllers/samples-controller");

const CheckAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:kid/:sid", samplesController.getSampleById);

router.use(CheckAuth);

router.put("/run-test", samplesController.runSampleTest);

router.patch("/post-sample-removal", samplesController.postSampleRemovalFromInstrument);

module.exports = router;
