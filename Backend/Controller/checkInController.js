const CheckIn = require("../Model/checkIn");

// POST /api/checkins (Pro only — see Routes/checkInRoutes.js)
async function createCheckIn(req, res) {
  try {
    const { label, time, daysOfWeek, gracePeriodMinutes } = req.body;

    if (!time) {
      return res.status(400).json({ success: false, error: "time (HH:mm) is required" });
    }

    const checkIn = await CheckIn.create({
      userId: req.user.id,
      label,
      time,
      daysOfWeek,
      gracePeriodMinutes,
    });

    res.status(201).json({ success: true, data: checkIn });
  } catch (err) {
    console.error("createCheckIn error:", err.message);
    res.status(400).json({ success: false, error: err.message || "Failed to create check-in" });
  }
}

// GET /api/checkins
async function listCheckIns(req, res) {
  try {
    const checkIns = await CheckIn.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: checkIns });
  } catch (err) {
    console.error("listCheckIns error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch check-ins" });
  }
}

// PATCH /api/checkins/:id/toggle
async function toggleCheckIn(req, res) {
  try {
    const checkIn = await CheckIn.findOne({ _id: req.params.id, userId: req.user.id });
    if (!checkIn) {
      return res.status(404).json({ success: false, error: "Check-in not found" });
    }
    checkIn.active = !checkIn.active;
    await checkIn.save();
    res.json({ success: true, data: checkIn });
  } catch (err) {
    console.error("toggleCheckIn error:", err.message);
    res.status(500).json({ success: false, error: "Failed to update check-in" });
  }
}

// DELETE /api/checkins/:id
async function deleteCheckIn(req, res) {
  try {
    const result = await CheckIn.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, error: "Check-in not found" });
    }
    res.json({ success: true, message: "Check-in deleted" });
  } catch (err) {
    console.error("deleteCheckIn error:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete check-in" });
  }
}

// POST /api/checkins/:id/confirm — user taps "I'm OK" after being pinged
async function confirmCheckIn(req, res) {
  try {
    const checkIn = await CheckIn.findOne({ _id: req.params.id, userId: req.user.id });
    if (!checkIn) {
      return res.status(404).json({ success: false, error: "Check-in not found" });
    }
    if (checkIn.lastStatus !== "pending") {
      return res.status(400).json({ success: false, error: "No pending check-in to confirm" });
    }
    checkIn.lastStatus = "confirmed";
    checkIn.confirmedAt = new Date();
    await checkIn.save();
    res.json({ success: true, data: checkIn });
  } catch (err) {
    console.error("confirmCheckIn error:", err.message);
    res.status(500).json({ success: false, error: "Failed to confirm check-in" });
  }
}

module.exports = { createCheckIn, listCheckIns, toggleCheckIn, deleteCheckIn, confirmCheckIn };
