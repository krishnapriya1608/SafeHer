const express = require("express");

const router = express.Router();
const adminOnly = require("../Middleware/adminOnly");

const userController = require("../Controller/userController");
const dashController=require("../Controller/dashController")
console.log(userController);

router.post("/register", userController.RegisterUser);
router.post("/verify-otp", userController.verifyOtp);

router.post("/resend-otp", userController.resendOTP);

router.post("/login", userController.loginUser);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password/:token", userController.resetPassword);
router.get("/pending-approvals", adminOnly, userController.getPendingApprovals);
router.patch("/:id/approval", adminOnly, userController.updateApprovalStatus);

// router.post("/logout", userController.logoutUser);

module.exports = router;