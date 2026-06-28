const express = require("express");

const router = express.Router();

const userController = require("../Controller/userController");
const dashController=require("../Controller/dashController")
console.log(userController);

router.post("/register", userController.RegisterUser);
router.post("/verify-otp", userController.verifyOtp);

router.post("/resend-otp", userController.resendOTP);

router.post("/login", userController.loginUser);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password/:token", userController.resetPassword);

// router.post("/logout", userController.logoutUser);
router.post("/create", dashController.createDashboard);
router.get("/:userId", dashController.getDashboard);
router.put("/profile/:userId", dashController.updateProfile);
router.post("/contact/:userId", dashController.addEmergencyContact);
router.delete("/contact/:userId/:contactId", dashController.deleteEmergencyContact);
router.put("/status/:userId", dashController.updateCurrentStatus);

module.exports = router;