const Emergency = require("../Model/emergencyModel");

exports.createEmergency = async (req, res) => {
  try {
    const {
      userId,
      username,
      email,
      latitude,
      longitude,
      address,
      message,
    } = req.body;

    if (!userId || !username || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "User and location details are required",
      });
    }

    const emergency = await Emergency.create({
      userId,
      username,
      email,
      latitude,
      longitude,
      address,
      message,
    });

    const io = req.app.get("io");

    io.emit("new-emergency", {
      emergency,
      message: "New SOS emergency alert received",
    });

    res.status(201).json({
      success: true,
      message: "SOS alert saved and broadcasted",
      emergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating emergency alert",
      error: error.message,
    });
  }
};



exports.getEmergencyHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const emergencies = await Emergency.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username email role");

    res.status(200).json({
      success: true,
      emergencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching emergency history",
      error: error.message,
    });
  }
};

exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username email role");

    res.status(200).json({
      success: true,
      emergencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching emergencies",
      error: error.message,
    });
  }
};

exports.acceptEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { volunteerId, volunteerName } = req.body;

    if (!volunteerId || !volunteerName) {
      return res.status(400).json({
        success: false,
        message: "volunteerId and volunteerName are required",
      });
    }

    const emergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      { acceptedBy: volunteerId, acceptedByName: volunteerName },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    const io = req.app.get("io");

    io.emit("emergency-accepted", {
      emergency,
      message: `${volunteerName} accepted this case`,
    });

    res.status(200).json({
      success: true,
      message: "Case accepted",
      emergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accepting emergency",
      error: error.message,
    });
  }
};
exports.getEmergencyById = async (req, res) => {
  try {
    const { emergencyId } = req.params;

    const emergency = await Emergency.findById(emergencyId);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    res.status(200).json({
      success: true,
      emergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching emergency",
      error: error.message,
    });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;

    const emergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      { status: "Resolved" },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    const io = req.app.get("io");

    io.emit("emergency-resolved", {
      emergency,
      message: "Emergency alert resolved",
    });

    res.status(200).json({
      success: true,
      message: "Emergency resolved successfully",
      emergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resolving emergency",
      error: error.message,
    });
  }
};



