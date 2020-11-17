const express = require("express");

const kioskController = require("../controllers/kiosk-controller");

const router = express.Router();

router.get("/:kid", kioskController.getKiosk);

module.exports = router;
