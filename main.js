import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import doctorRoutes from "./routes/docRoutes.js";
import patientRoutes from "./routes/patientRoutes.js"
import prescriptionRoutes from "./routes/prescriptionRoutes.js"
import storeRoutes from "./routes/storeRoutes.js"
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api", doctorRoutes);
app.use("/api/p",patientRoutes);
app.use("/api/med", prescriptionRoutes);
app.use("/api/s",storeRoutes)

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Hello from backend 👋" });
});


const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow your Expo frontend
  },
});


// ✅ Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Join doctor room (frontend sends doctorId)
  socket.on("joinDoctorRoom", (doctorId) => {
    socket.join(doctorId);
    console.log(`📌 Client ${socket.id} joined room doctor:${doctorId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Helper to emit doctor updates
export const notifyDoctorUpdate = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId)
    .populate("queue")
    .populate("consultedPatients");

  if (doctor) {
    io.to(doctorId.toString()).emit("queueUpdate", {
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
      patientsInQueue: doctor.patientsInQueue,
      queue: doctor.queue,
      consultedPatients: doctor.consultedPatients,
    });
  }
};


// Start server
httpServer.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
