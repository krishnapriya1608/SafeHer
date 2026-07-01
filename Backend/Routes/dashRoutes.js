const express = require("express");

const router = express.Router();
const dashController = require("../Controller/dashController");


router.post("/create", dashController.createDashboard);
router.get("/:userId", dashController.getDashboard);
router.put("/profile/:userId", dashController.updateProfile);
router.post("/contact/:userId", dashController.addEmergencyContact);
router.delete("/contact/:userId/:contactId", dashController.deleteEmergencyContact);
router.put("/status/:userId", dashController.updateCurrentStatus);


module.exports = router;
