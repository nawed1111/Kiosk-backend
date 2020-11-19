const express = require("express");
const samplesController = require("../controllers/samples-controller");

const CheckAuth = require("../middleware/check-auth");

const router = express.Router();

// router.use(CheckAuth);

router.get("/:kid/:sid", samplesController.getSampleById);

router.put("/run-test", samplesController.runSampleTest);

router.patch("/post-completion", samplesController.postTestRunCompletion);

module.exports = router;
