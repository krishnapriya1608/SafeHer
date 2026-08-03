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
const {trustedContactRoutes} = require('./Routes/trustedContactRoutes');

require("./DB/connection");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST","PATCH", "PUT", "DELETE"],
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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST","PATCH", "PUT", "DELETE"],
  },
});

app.set("io", io);

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

  // Only responders receive new emergency broadcasts.
  if (["volunteer", "police", "admin"].includes(socket.user.role)) {
    socket.join("responders");
  }

  registerLiveTrackingHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});