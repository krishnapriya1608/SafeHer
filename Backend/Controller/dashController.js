const Dashboard = require("../Model/dashboardModel");
const io = req.app.get("io");
const createDashboard = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      location,
      medicalNotes,
      emergencyContacts,
    } = req.body;

    const existingDashboard = await Dashboard.findOne({ userId });

    if (existingDashboard) {
      return res.status(200).json({
        message: "Dashboard already exists for this user",
        dashboard: existingDashboard,
      });
    }

    const dashboard = await Dashboard.create({
      userId,
      fullName,
      phone,
      location,
      medicalNotes,
      emergencyContacts,
      recentAlerts: [
        {
          title: "Profile created",
          detail: "Your dashboard profile has been created successfully.",
          level: "normal",
        },
      ],
    });

    res.status(201).json({
      message: "Dashboard created successfully",
      dashboard,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating dashboard",
      error: error.message,
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const dashboard = await Dashboard.findOne({ userId }).populate(
      "userId",
      "username email role"
    );

    if (!dashboard) {
      return res.status(404).json({
        message: "Dashboard not found",
      });
    }

    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const dashboard = await Dashboard.findOneAndUpdate(
      { userId },
      {
        fullName: req.body.fullName,
        phone: req.body.phone,
        location: req.body.location,
        medicalNotes: req.body.medicalNotes,
      },
      { new: true }
    );

    if (!dashboard) {
      return res.status(404).json({
        message: "Dashboard not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      dashboard,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

const addEmergencyContact = async (req, res) => {
  try {
    const { userId } = req.params;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        message: "Dashboard not found",
      });
    }

    dashboard.emergencyContacts.push(req.body);
    await dashboard.save();

    res.status(200).json({
      message: "Emergency contact added successfully",
      emergencyContacts: dashboard.emergencyContacts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding emergency contact",
      error: error.message,
    });
  }
};

const deleteEmergencyContact = async (req, res) => {
  try {
    const { userId, contactId } = req.params;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        message: "Dashboard not found",
      });
    }

    dashboard.emergencyContacts = dashboard.emergencyContacts.filter(
      (contact) => contact._id.toString() !== contactId
    );

    await dashboard.save();

    res.status(200).json({
      message: "Emergency contact deleted successfully",
      emergencyContacts: dashboard.emergencyContacts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting emergency contact",
      error: error.message,
    });
  }
};

const updateCurrentStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentStatus } = req.body;

    const dashboard = await Dashboard.findOne({ userId });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    dashboard.currentStatus = currentStatus;

    dashboard.recentAlerts.unshift({
      title: `Status changed to ${currentStatus}`,
      detail: "Your current safety status was updated.",
      level:
        currentStatus === "Emergency"
          ? "danger"
          : currentStatus === "Need Help"
            ? "warning"
            : "normal",
    });

    await dashboard.save();

    // NEW: create an Emergency record so volunteers actually see this,
    // for both "Need Help" (checkin) and "Emergency" (sos) states.
    if (currentStatus === "Need Help" || currentStatus === "Emergency") {
      const emergency = await Emergency.create({
        userId,
        username: dashboard.fullName,
        email: req.body.email || "", // ASSUMPTION: pass this from the frontend call — dashboard doc has no email field
        phone: dashboard.phone || "",
        medicalNotes: dashboard.medicalNotes || "",
        type: currentStatus === "Need Help" ? "checkin" : "sos",
        status: "Active",
      });

      const io = getIO();
      if (currentStatus === "Need Help") {
        io.emit("new-checkin", { emergency });
      } else {
        io.emit("new-emergency", { emergency });
      }
    }

    res.status(200).json({
      message: "Current status updated successfully",
      currentStatus: dashboard.currentStatus,
      recentAlerts: dashboard.recentAlerts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating current status", error: error.message });
  }
};

module.exports = {
  createDashboard,
  getDashboard,
  updateProfile,
  addEmergencyContact,
  deleteEmergencyContact,
  updateCurrentStatus,
};