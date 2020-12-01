const express = require("express");
const checkAuth = require("../middleware/check-auth");

const instrumentController = require("../controllers/instrument-controller");

const router = express.Router();

router.use(checkAuth);

router.get("/instrument/:iid", instrumentController.getInstrumentFromLIMS);
router.post(
  "/instrument/:iid",
  instrumentController.getSelectedPropertiesOfInstrumentFromLIMS
);
router.get("/:kid", instrumentController.getInstruments);

module.exports = router;
