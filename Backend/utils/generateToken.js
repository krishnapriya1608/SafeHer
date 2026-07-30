


const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id username email role");
    if (!user) throw new Error("User not found");

    req.user = {
      id: user._id.toString(), username: user.username,
      email: user.email, role: user.role,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};


