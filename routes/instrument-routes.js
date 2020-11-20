const express = require("express");
const CheckAuth = require("../middleware/check-auth");

const instrumentController = require("../controllers/instrument-controller");

const router = express.Router();

router.use(CheckAuth);

router.get("/:kid", instrumentController.getInstruments);
router.get("/:id", instrumentController.getInstrument);

module.exports = router;
