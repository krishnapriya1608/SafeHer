const User = require("../Model/userModel");

module.exports = async function requirePro(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("plan planExpiry");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isActivePro = user.plan === "pro" && user.planExpiry && user.planExpiry > new Date();

    if (!isActivePro) {
      return res.status(403).json({
        success: false,
        error: "This feature requires a Pro subscription",
        code: "PRO_REQUIRED",
      });
    }

    next();
  } catch (err) {
    console.error("requirePro error:", err.message);
    res.status(500).json({ success: false, error: "Failed to verify subscription" });
  }
};
