const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  upvoteReport,
  deleteReport,
} = require("../Controller/reportController");
const uploadReportImages = require("../middleware/uploadReportImages");

// If you have admin auth middleware already (e.g. verifyAdmin), import and
// apply it to the status-update route below — left as a TODO since it
// depends on your existing auth setup.
// const { verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", uploadReportImages.array("images", 5), createReport);
router.get("/", getReports);
router.get("/:id", getReportById);
router.patch("/:id/status", /* verifyAdmin, */ updateReportStatus);
router.post("/:id/upvote", upvoteReport);
router.delete("/:id", /* verifyAdmin, */ deleteReport);

module.exports = router;
