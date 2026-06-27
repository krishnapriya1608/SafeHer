const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

router.post("/register", authController.RegisterUser);

router.post("/verify-otp", authController.verifyOtp);

router.post("/resend-otp", authController.resendOTP);

router.post("/login", authController.loginUser);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password/:token", authController.resetPassword);

router.post("/logout", authController.logoutUser);

module.exports = router;