import express from "express";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import { notifyDoctorUpdate } from "../main.js";

const router = express.Router();

// Create a doctor
router.post("/doctor", async (req, res) => {
  try {
    const { name, specialization } = req.body;
    const doctor = new Doctor({ name, specialization });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add patient to queue
router.post("/doctor/:doctorId/queue", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, number, age } = req.body;

    const patient = new Patient({ name, number, age });
    await patient.save();

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    doctor.queue.push(patient._id);
    doctor.patientsInQueue = doctor.queue.length;
    await doctor.save();
    notifyDoctorUpdate(doctorId);
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Move patient from queue → consulted
router.post("/doctor/:doctorId/consult", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).populate("queue");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    if (doctor.queue.length === 0) {
      return res.status(400).json({ error: "No patients in queue" });
    }

    const patient = doctor.queue.shift(); // take first in queue
    doctor.consultedPatients.push(patient._id);
    doctor.patientsInQueue = doctor.queue.length;
    await doctor.save();

    res.json({ message: "Patient consulted", doctor, patient });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get list of all doctors
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find().select("name specialization patientsInQueue");
    res.json(doctors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single doctor with patients
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId)
      .populate("queue")
      .populate("consultedPatients");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
