const express = require("express");
const {
  createEmergency,
  getEmergencyHistory,
  getAllEmergencies,
  resolveEmergency,
} = require("../Controller/emergencyController");

const router = express.Router();

router.post("/create", createEmergency);
router.get("/history/:userId", getEmergencyHistory);
router.get("/all", getAllEmergencies);
router.put("/resolve/:emergencyId", resolveEmergency);

module.exports = router;