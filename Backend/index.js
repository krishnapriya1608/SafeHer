require('dotenv').config()
const express=require('express')
const cors=require('cors')
const userRoutes=require('./Routes/routes')
const dashboardRoutes=require('./Routes/dashRoutes')
const emergencyRoute = require("./Routes/emergencyRoutes");
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

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
const PORT=5000

server.listen(5000, () => {
  console.log("Server running on port 5000");
});


