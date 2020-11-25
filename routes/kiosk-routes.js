const express = require("express");

const kioskController = require("../controllers/kiosk-controller");
const roleRequired = require("../middleware/required-role");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// router.use(checkAuth);

router.get("/", checkAuth, roleRequired("admin"), kioskController.getKiosks);

router.get("/:kid", kioskController.getKiosk);

router.put("/:kid", roleRequired("admin"), kioskController.createKiosk);

router.patch("/:kid", roleRequired("admin"), kioskController.updateKiosk);

module.exports = router;
