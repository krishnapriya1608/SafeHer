const express = require("express");

const router = express.Router();

const userController = require("../Controller/userController");
console.log(userController);

router.post("/register", userController.RegisterUser);
// router.post("/verify-otp", userController.verifyOtp);

// router.post("/resend-otp", userController.resendOTP);

// router.post("/login", userController.loginUser);

// router.post("/forgot-password", userController.forgotPassword);

// router.post("/reset-password/:token", userController.resetPassword);

// router.post("/logout", userController.logoutUser);

module.exports = router;