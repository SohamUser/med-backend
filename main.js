import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import doctorRoutes from "./routes/docRoutes.js";
import patientRoutes from "./routes/patientRoutes.js"
import prescriptionRoutes from "./routes/prescriptionRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api", doctorRoutes);
app.use("/api/p",patientRoutes);
app.use("/api/med", prescriptionRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Hello from backend 👋" });
});

// Start server
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
