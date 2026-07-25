require('dotenv').config()
const express=require('express')
const cors=require('cors')
const userRoutes=require('./Routes/routes')
const dashboardRoutes=require('./Routes/dashRoutes')
const emergencyRoute = require("./Routes/emergencyRoutes");
const fakeCallRoute = require("./Routes/fakeCallRoutes");
const http = require("http");
const { Server } = require("socket.io");
const Emergency = require("./Model/emergencyModel");
require('./DB/connection')


const app=express()

app.use(cors())

app.use(express.json())

app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/emergency", emergencyRoute);
app.use("/api/fakecall", fakeCallRoute);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ---- Phase 5: Live Tracking rooms ----
  // Anyone tracking a specific emergency (the victim's own device, plus
  // any responder viewing the live map) joins a room named after the
  // emergency's Mongo _id, so location updates only reach that group.
  socket.on("join-emergency-room", (emergencyId) => {
    if (!emergencyId) return;
    socket.join(`emergency-${emergencyId}`);
  });

  socket.on("leave-emergency-room", (emergencyId) => {
    if (!emergencyId) return;
    socket.leave(`emergency-${emergencyId}`);
  });

  // Victim's device streams live coordinates while the SOS is active.
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

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
const PORT=5000

server.listen(5000, () => {
  console.log("Server running on port 5000");
});