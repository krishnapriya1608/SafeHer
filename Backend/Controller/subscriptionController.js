const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../Model/userModel");
const SubscriptionPayment = require("../Model/SubscriptionPayment");
const ChatLog = require("../Model/ChatLog");

const PRO_PLAN_AMOUNT_PAISE = Number(process.env.PRO_PLAN_AMOUNT_PAISE) || 9900;
const PLAN_DURATION_DAYS = 30;
const FREE_DAILY_MESSAGE_LIMIT = 10;

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured");
  }
  return new Razorpay({ key_id, key_secret });
}

// POST /api/subscription/create-order
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: PRO_PLAN_AMOUNT_PAISE,
      currency: "INR",
      receipt: `pro_${userId}_${Date.now()}`,
      notes: { userId, plan: "pro" },
    });

    await SubscriptionPayment.create({
      userId,
      plan: "pro",
      amount: PRO_PLAN_AMOUNT_PAISE,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error("createOrder error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create payment order" });
  }
}

// POST /api/subscription/verify
async function verifyPayment(req, res) {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment verification fields" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await SubscriptionPayment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed", razorpayPaymentId: razorpay_payment_id }
      );
      return res.status(400).json({ success: false, error: "Payment verification failed" });
    }

    const periodStart = new Date();
    const periodEnd = new Date(periodStart.getTime() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000);

    await SubscriptionPayment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        periodStart,
        periodEnd,
      }
    );

    const user = await User.findByIdAndUpdate(
      userId,
      { plan: "pro", planExpiry: periodEnd },
      { returnDocument: "after" }
    );

    res.json({
      success: true,
      data: { plan: user.plan, planExpiry: user.planExpiry },
    });
  } catch (err) {
    console.error("verifyPayment error:", err.message);
    res.status(500).json({ success: false, error: "Failed to verify payment" });
  }
}

// GET /api/subscription/status
async function getStatus(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("plan planExpiry");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isExpired = user.plan === "pro" && user.planExpiry && user.planExpiry < new Date();
    if (isExpired) {
      user.plan = "free";
      user.planExpiry = null;
      await user.save();
    }

    const isActivePro = user.plan === "pro" && user.planExpiry && user.planExpiry > new Date();

    let aiMessagesUsedToday = 0;
    if (!isActivePro) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      aiMessagesUsedToday = await ChatLog.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
    }

    res.json({
      success: true,
      data: {
        plan: user.plan,
        planExpiry: user.planExpiry,
        aiMessagesUsedToday,
        aiMessagesLimit: isActivePro ? null : FREE_DAILY_MESSAGE_LIMIT,
      },
    });
  } catch (err) {
    console.error("getStatus error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch subscription status" });
  }
}

module.exports = { createOrder, verifyPayment, getStatus };
