const User = require("../Model/userModel");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");

const { protect, generateToken } = require("../utils/generateToken");


// =======================
// Register User
// =======================

exports.RegisterUser = async (req, res) => {
  console.log("Inside Register User");

  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: userEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashOtp = await bcrypt.hash(otp, 10);

    await sendEmail({
      to: userEmail,
      subject: "OTP Verification",
      html: `<h2>Your OTP is ${otp}</h2>
             <p>This OTP will expire in 10 minutes.</p>`,
    });

    await User.create({
      username,
      email: userEmail,
      password: hashPassword,
      role: role || "user",
      otp: hashOtp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================
// Verify OTP
// =======================

exports.verifyOtp = async (req, res) => {
  console.log("Inside Verify OTP");

  try {
    const { email, otp } = req.body;

    const userEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (existingUser.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    const compareOtp = await bcrypt.compare(
      otp.toString(),
      existingUser.otp
    );

    if (!compareOtp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    existingUser.isVerified = true;
    existingUser.otp = null;
    existingUser.otpExpiry = null;

    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Account Verified Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================
// Resend OTP
// =======================

exports.resendOTP = async (req, res) => {
  console.log("Inside Resend OTP");

  try {
    const { email } = req.body;

    const userEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (existingUser.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    // Generate New OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashOtp = await bcrypt.hash(otp, 10);

    existingUser.otp = hashOtp;
    existingUser.otpExpiry = Date.now() + 10 * 60 * 1000;

    await existingUser.save();

    // Send Email
    await sendEmail({
      to: userEmail,
      subject: "Resend OTP",
      html: `<h2>Your New OTP is ${otp}</h2>
             <p>This OTP will expire in 10 minutes.</p>`,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================
// Forgot Password
// =======================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      html: `
      <h2>Password Reset</h2>

      <p>Click the button below to reset your password.</p>

      <a href="${resetLink}">
          <button
            style="
              background:#2563eb;
              color:white;
              padding:12px 20px;
              border:none;
              border-radius:8px;
              cursor:pointer;">
              Reset Password
          </button>
      </a>

      <p>This link expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// =======================
// Reset Password
// =======================


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (comparePassword) {
      return res.status(400).json({
        message: "New password cannot be same as old password",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });

  } catch (err) {

    return res.status(400).json({
      message: "Invalid or Expired Link",
    });

  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};