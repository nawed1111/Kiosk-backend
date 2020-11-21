const express = require("express");

const kioskController = require("../controllers/kiosk-controller");

const router = express.Router();

router.get("/:kid", kioskController.getKiosk);

router.put("/:kid", kioskController.createKiosk);

router.patch("/:kid", kioskController.updateKiosk);

module.exports = router;
