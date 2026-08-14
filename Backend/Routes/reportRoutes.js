const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  upvoteReport,
  deleteReport,
} = require("../Controller/reportController");
const uploadReportImages = require("../Middleware/uploadReportImages");
const { protect, authorize } = require("../utils/generateToken");

const router = express.Router();

router.post("/", uploadReportImages.array("images", 5), createReport);
router.get("/", getReports);
router.get("/:id", getReportById);
router.patch("/:id/status", protect, authorize("police", "admin"), updateReportStatus);
router.post("/:id/upvote", upvoteReport);
router.delete("/:id", protect, authorize("police", "admin"), deleteReport);

module.exports = router;