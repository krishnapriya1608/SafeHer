const Emergency = require("../Model/emergencyModel");
const User = require("../Model/userModel");

const FREE_MAX_FOLLOWERS = 1; // free plan: 1 guardian watching at a time


function registerLiveTrackingHandlers(io, socket) {

  socket.on("join-emergency-room", async (emergencyId) => {
    if (!emergencyId) return;

    const room = `emergency-${emergencyId}`;

    try {
      const emergency = await Emergency.findById(emergencyId).select("userId");
      if (!emergency) return;

      const isOwner = socket.user?.id === emergency.userId.toString();

      // The person whose emergency it is can always join their own room.
      // The cap only applies to guardians/followers watching someone else.
      if (!isOwner) {
        const owner = await User.findById(emergency.userId).select("plan planExpiry");
        const ownerIsActivePro =
          owner?.plan === "pro" && owner.planExpiry && owner.planExpiry > new Date();

        if (!ownerIsActivePro) {
          const currentRoom = io.sockets.adapter.rooms.get(room);
          const currentFollowerCount = currentRoom ? currentRoom.size : 0;

          if (currentFollowerCount >= FREE_MAX_FOLLOWERS) {
            socket.emit("follow-denied", {
              emergencyId,
              reason: "This free-plan user already has the maximum number of live followers. Upgrade to Pro for multiple simultaneous followers.",
            });
            return;
          }
        }
      }

      socket.join(room);
    } catch (err) {
      console.log("join-emergency-room failed:", err.message);
    }
  });

  socket.on("leave-emergency-room", (emergencyId) => {
    if (!emergencyId) return;
    socket.leave(`emergency-${emergencyId}`);
  });

  socket.on("send-location-update", async ({ emergencyId, latitude, longitude }) => {
    if (!emergencyId || latitude == null || longitude == null) return;

    const point = { latitude, longitude, timestamp: Date.now() };

    try {
      const emergency = await Emergency.findByIdAndUpdate(
        emergencyId,
        {
          latitude,
          longitude,
          $push: { locationHistory: point },
        },
        { new: true }
      );

      if (!emergency) return;

      io.to(`emergency-${emergencyId}`).emit("location-update", {
        emergencyId,
        latitude,
        longitude,
        timestamp: point.timestamp,
      });
    } catch (err) {
      console.log("Failed to persist/broadcast location update:", err.message);
    }
  });
}

module.exports = { registerLiveTrackingHandlers };