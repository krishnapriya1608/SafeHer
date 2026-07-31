const express = require("express");
const {
  createEmergency,
  getEmergencyHistory,
  getAllEmergencies,
  acceptEmergency,
  resolveEmergency,
  getEmergencyById
} = require("../Controller/emergencyController");
const { protect, authorize } = require("../utils/generateToken");

const router = express.Router();

router.use(protect);

router.post("/create", authorize("user"), createEmergency);
router.get("/history/:userId", getEmergencyHistory);

router.get(
  "/all",
  authorize("volunteer", "police", "admin"),
  getAllEmergencies
);
router.get("/single/:emergencyId",getEmergencyById); 


router.put(
  "/accept/:emergencyId",
  authorize("volunteer", "police"),
  acceptEmergency
);

router.put(
  "/resolve/:emergencyId",
  authorize("volunteer", "police", "admin"),
  resolveEmergency
);

module.exports = router;