const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/requireAuth");
const { createOrder, verifyPayment, getStatus } = require("../Controller/subscriptionController");

router.post("/create-order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);
router.get("/status", requireAuth, getStatus);

module.exports = router;
