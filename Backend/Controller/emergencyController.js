const Emergency = require("../Model/emergencyModel");
const User = require("../Model/userModel");
const { distanceMeters } = require("../utils/geo");
const { streamIncidentReportPdf } = require("../utils/generateIncidentPdf");

const PRIORITY_RADIUS_METERS = 5000; // 5km — nearest responders get a direct, immediate ping

exports.createEmergency = async (req, res) => {
  try {
    const { userId, username, email, latitude, longitude, address, message, phone, medicalNotes } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ success: false, message: "User details are required" });
    }

    const emergency = await Emergency.create({
      userId, username, email,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      address, message, phone, medicalNotes,
    });

    const io = req.app.get("io");

    io.emit("new-emergency", {
      emergency,
      message: "New SOS emergency alert received",
    });

    // Pro users additionally get an immediate, targeted ping to the nearest
    // connected responders (by live location), on top of the normal
    // broadcast every user already gets above. This never reduces free
    // users' coverage — it's an extra speed boost for Pro, not a gate.
    try {
      const creator = await User.findById(userId).select("plan planExpiry");
      const isActivePro = creator?.plan === "pro" && creator.planExpiry && creator.planExpiry > new Date();

     if (isActivePro && latitude != null && longitude != null){
        const volunteerLocations = req.app.get("volunteerLocations");
        if (volunteerLocations && volunteerLocations.size > 0) {
          const alertPoint = [Number(latitude), Number(longitude)];
          const nearby = [];

          for (const [respUserId, loc] of volunteerLocations.entries()) {
            const dist = distanceMeters(alertPoint, [loc.lat, loc.lng]);
            if (dist <= PRIORITY_RADIUS_METERS) {
              nearby.push({ ...loc, userId: respUserId, distanceMeters: Math.round(dist) });
            }
          }

          nearby.sort((a, b) => a.distanceMeters - b.distanceMeters);

          for (const responder of nearby) {
            io.to(responder.socketId).emit("priority-emergency", {
              emergency,
              distanceMeters: responder.distanceMeters,
              message: "Priority SOS alert nearby — Pro user request",
            });
          }
        }
      }
    } catch (priorityErr) {
      // Never let the priority-targeting step block or fail the core alert.
      console.error("Priority alert targeting failed:", priorityErr.message);
    }

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

exports.acknowledgeCheckin = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      { status: "Acknowledged" }, // requires adding "Acknowledged" to the schema's status enum
      { new: true }
    );
    if (!emergency) {
      return res.status(404).json({ success: false, message: "Check-in not found" });
    }
    const io = req.app.get("io");
    io.emit("checkin-acknowledged", { emergency });
    res.status(200).json({ success: true, message: "Check-in acknowledged", emergency });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error acknowledging check-in", error: error.message });
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

    // Only the person who raised it, or a responder, may view it —
    // this record now carries phone/medicalNotes, so it's not public.
    const isOwner = emergency.userId.toString() === req.user.id;
    const isResponder = ["volunteer", "police", "admin"].includes(req.user.role);
    if (!isOwner && !isResponder) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this emergency",
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

// GET /api/emergency/:emergencyId/export-pdf (Pro only — see Routes/emergencyRoutes.js)
exports.exportIncidentPdf = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await Emergency.findById(emergencyId);

    if (!emergency) {
      return res.status(404).json({ success: false, message: "Emergency not found" });
    }

    // Only the person who raised it (or a responder) may download it.
    const isOwner = emergency.userId.toString() === req.user.id;
    const isResponder = ["volunteer", "police", "admin"].includes(req.user.role);
    if (!isOwner && !isResponder) {
      return res.status(403).json({ success: false, message: "Not authorized to export this report" });
    }

    streamIncidentReportPdf(res, emergency);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating incident report",
      error: error.message,
    });
  }
};



