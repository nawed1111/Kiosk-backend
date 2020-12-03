const express = require("express");
const checkAuth = require("../middleware/check-auth");
const getLIMSToken = require("../middleware/get-LIMS-token");

const instrumentController = require("../controllers/instrument-controller");

const router = express.Router();

router.use(checkAuth);

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
router.get("/:kid", instrumentController.getInstruments);

module.exports = router;
