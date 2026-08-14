require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const userRoutes = require("./Routes/routes");
const dashboardRoutes = require("./Routes/dashRoutes");
const emergencyRoute = require("./Routes/emergencyRoutes");
const fakeCallRoute = require("./Routes/fakeCallRoutes");
const safeRouteRoute = require("./Routes/safeRouteRoutes");
const User = require("./Model/userModel");
const reportRoutes = require("./Routes/reportRoutes");
const { registerLiveTrackingHandlers } = require("./Controller/LivetrackingController");
const trustedContactRoutes = require('./Routes/trustedContactRoutes');
const aiSafetyRoutes = require("./Routes/aiSafetyRoutes");
const subscriptionRoutes = require("./Routes/subscriptionRoutes");
const checkInRoutes = require("./Routes/checkInRoutes");
const { startCheckInScheduler } = require("./utils/checkInScheduler");
const errorHandler = require("./Middleware/errorHandler");
require("./DB/connection");

const app = express();
const server = http.createServer(app);

// Strip any trailing slash from CLIENT_URL so a stray "/" pasted into the
// Render env var (e.g. "https://app.vercel.app/") doesn't silently break
// CORS by failing an exact string match against the browser's Origin header.
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"))

app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/emergency", emergencyRoute);
app.use("/api/fakecall", fakeCallRoute);
app.use("/api/saferoute", safeRouteRoute);
app.use("/api/reports", reportRoutes);
app.use('/api/contacts', trustedContactRoutes);
app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/ai-safety", aiSafetyRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/checkins", checkInRoutes);

app.use(errorHandler);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

app.set("io", io);

// In-memory map of currently-connected volunteers/police and their last
// known location, keyed by userId. Used to target the nearest responders
// for Pro users' priority alerts. Cleared on disconnect; not persisted
// (a volunteer who reconnects just re-sends their location).
const volunteerLocations = new Map();
app.set("volunteerLocations", volunteerLocations);

// Require a valid JWT before allowing a Socket.IO connection.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "_id username email role"
    );

    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id} (${socket.user.role})`);

  // Lets us target this specific user later (e.g. a check-in ping),
  // regardless of role.
  socket.join(`user-${socket.user.id}`);

  // Only responders receive new emergency broadcasts.
  if (["volunteer", "police", "admin"].includes(socket.user.role)) {
    socket.join("responders");
  }

  // Volunteers/police can push their live location so Pro users' alerts
  // can be prioritized to the nearest responders.
  if (["volunteer", "police"].includes(socket.user.role)) {
    socket.on("update-location", ({ lat, lng }) => {
      if (typeof lat !== "number" || typeof lng !== "number") return;
      volunteerLocations.set(socket.user.id, {
        lat,
        lng,
        socketId: socket.id,
        username: socket.user.username,
        updatedAt: Date.now(),
      });
    });
  }

  registerLiveTrackingHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    volunteerLocations.delete(socket.user.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCheckInScheduler(io);
});