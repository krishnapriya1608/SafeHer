const express = require("express");
const router = express.Router();
const { protect } = require("../utils/generateToken");
const requirePro = require("../Middleware/requirePro");
const {
  createCheckIn,
  listCheckIns,
  toggleCheckIn,
  deleteCheckIn,
  confirmCheckIn,
} = require("../Controller/checkInController");

router.use(protect);

router.post("/", requirePro, createCheckIn);
router.get("/", listCheckIns);
router.patch("/:id/toggle", toggleCheckIn);
router.delete("/:id", deleteCheckIn);
router.post("/:id/confirm", confirmCheckIn);

module.exports = router;
