const mongoose = require("mongoose");

const CATEGORIES = [
  "poor_lighting",
  "harassment",
  "no_police_presence",
  "suspicious_activity",
  "stray_animals",
  "unsafe_construction",
  "isolated_area",
  "other",
];

const STATUSES = ["pending", "verified", "rejected", "resolved"];

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      // Reports can be anonymous — userId is optional.
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" },
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [{ type: String }], // relative URLs served from /uploads
    status: {
      type: String,
      enum: STATUSES,
      default: "pending",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // Filled in by the optional AI classifier — not shown as fact, just a suggestion.
    aiSuggestion: {
      suggestedCategory: { type: String, default: null },
      suggestedSeverity: { type: String, default: null },
      flaggedForReview: { type: Boolean, default: false },
      note: { type: String, default: null },
    },
    upvotes: { type: Number, default: 0 },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// Speeds up "reports near me" bounding-box queries.
reportSchema.index({ "location.lat": 1, "location.lng": 1 });
reportSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Report", reportSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
