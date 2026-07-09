require('dotenv').config()
const express=require('express')
const cors=require('cors')
const userRoutes=require('./Routes/routes')
const dashboardRoutes=require('./Routes/dashRoutes')
const emergencyRoute = require("./Routes/emergencyRoutes");
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

  // Responder (volunteer/police) joins the room for a specific emergency
  socket.on("join-tracking-room", (emergencyId) => {
    socket.join(`tracking-${emergencyId}`);
    console.log(`${socket.id} joined tracking-${emergencyId}`);
  });

  socket.on("leave-tracking-room", (emergencyId) => {
    socket.leave(`tracking-${emergencyId}`);
  });

  // Victim's device streams live GPS into the room
  socket.on("send-location", async ({ emergencyId, latitude, longitude }) => {
    const point = { latitude, longitude, timestamp: Date.now() };

    // broadcast to everyone tracking this emergency (not back to sender)
    socket.to(`tracking-${emergencyId}`).emit("receive-location", {
      emergencyId,
      ...point,
    });

    // persist a lightweight trail for history/replay (fire and forget)
    try {
      await Emergency.findByIdAndUpdate(emergencyId, {
        $set: { latitude, longitude },
        $push: { locationHistory: point },
      });
    } catch (err) {
      console.error("Failed to persist location:", err.message);
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


