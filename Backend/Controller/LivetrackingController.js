const Emergency = require("../Model/emergencyModel");


function registerLiveTrackingHandlers(io, socket) {

  socket.on("join-emergency-room", (emergencyId) => {
    if (!emergencyId) return;
    socket.join(`emergency-${emergencyId}`);
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