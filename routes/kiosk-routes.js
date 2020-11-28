const express = require("express");

const kioskController = require("../controllers/kiosk-controller");
const roleRequired = require("../middleware/required-role");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", checkAuth, roleRequired("admin"), kioskController.getKiosks);

router.get("/:kid", kioskController.getKioskById);

router.use(checkAuth);
router.put("/:kid", roleRequired("admin"), kioskController.createKiosk);

router.patch("/:kid", roleRequired("admin"), kioskController.updateKiosk);

router.delete("/:kid", roleRequired("admin"), kioskController.deleteKiosk);

module.exports = router;
