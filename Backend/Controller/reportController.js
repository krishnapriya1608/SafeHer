const Report = require("../Model/reportModel");
const { classifyReport } = require("../utils/aiClassifier");

// POST /api/reports
// multipart/form-data: images (up to 5) + text fields below
// body: { userId?, lat, lng, address?, category, description }
const createReport = async (req, res) => {
  try {
    const { userId, lat, lng, address, category, description } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location (lat, lng) is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    if (!description || description.trim().length < 5) {
      return res.status(400).json({ message: "Please add a short description (5+ characters)" });
    }

    const images = (req.files || []).map(
      (file) => `/uploads/reports/${file.filename}`
    );

    // Best-effort AI suggestion — never blocks submission if it fails.
    const aiResult = await classifyReport({ description }).catch(() => null);

    const report = await Report.create({
      reporter: { userId: userId || null },
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address: address || "" },
      category,
      description: description.trim(),
      images,
      severity: aiResult?.suggestedSeverity || "medium",
      aiSuggestion: aiResult
        ? {
            suggestedCategory: aiResult.suggestedCategory || null,
            suggestedSeverity: aiResult.suggestedSeverity || null,
            flaggedForReview: !!aiResult.flaggedForReview,
            note: aiResult.note || null,
          }
        : undefined,
    });

    res.status(201).json({ report });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to submit report", error: err.message });
  }
};

// GET /api/reports?category=&status=&lat=&lng=&radiusKm=
const getReports = async (req, res) => {
  try {
    const { category, status, lat, lng, radiusKm } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    // Simple bounding-box filter for "reports near me" — good enough at
    // city scale without needing a geo index.
    if (lat && lng && radiusKm) {
      const latF = parseFloat(lat);
      const lngF = parseFloat(lng);
      const deg = parseFloat(radiusKm) / 111; // ~111km per degree latitude
      filter["location.lat"] = { $gte: latF - deg, $lte: latF + deg };
      filter["location.lng"] = { $gte: lngF - deg, $lte: lngF + deg };
    }

    const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: "Failed to load reports", error: err.message });
  }
};

// GET /api/reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: "Failed to load report", error: err.message });
  }
};

// PATCH /api/reports/:id/status  (admin only — protect this route with your admin auth middleware)
// body: { status, adminNote?, adminUserId? }
const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNote, adminUserId } = req.body;
    const validStatuses = ["pending", "verified", "rejected", "resolved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const update = {
      status,
      adminNote: adminNote || "",
    };
    if (status === "verified" || status === "resolved") {
      update.verifiedBy = adminUserId || null;
      update.verifiedAt = new Date();
    }

    const report = await Report.findByIdAndUpdate(req.params.id, update, {
      returnDocument: "after",
    });

    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: "Failed to update report status", error: err.message });
  }
};

// POST /api/reports/:id/upvote
const upvoteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { returnDocument: "after" }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: "Failed to upvote report", error: err.message });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  upvoteReport,
  deleteReport,
};
