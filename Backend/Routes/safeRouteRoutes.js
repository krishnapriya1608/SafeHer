const express = require("express");
const { searchPlaces, getSafeRoute, getHistory } = require("../Controller/safeRouteController");

const router = express.Router();

router.get("/search", searchPlaces);
router.post("/route", getSafeRoute);
router.get("/history/:userId", getHistory);

module.exports = router;
