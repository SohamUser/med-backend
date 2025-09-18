import express from "express";
import  Patient from "../models/Patient.js";
import  Doctor  from "../models/Doctor.js";
import { io, notifyDoctorUpdate } from "../main.js";

const router = express.Router();

/**
 * ✅ Patient consults a doctor
 * (Frontend: when patient clicks "Consult")
 */
router.post("/doctors/:id/consult", async (req, res) => {
    try {
      const { patientId } = req.body;   // ✅ frontend sends patientId (or phone)
      const doctorId = req.params.id;
  
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  
      const patient = await Patient.findById(patientId);
      if (!patient) return res.status(404).json({ message: "Patient not found" });
  
      // Check if already in queue (optional)
      if (doctor.queue.includes(patient._id)) {
        return res.status(400).json({ message: "Patient already in queue" });
      }
  
      // Add patient to doctor’s queue
      doctor.queue.push(patient._id);
doctor.patientsInQueue = doctor.queue.length;
await doctor.save();

io.emit("queueUpdate", {
  doctorId,
  patientsInQueue: doctor.patientsInQueue,
  queue: doctor.queue
});
  
      res.json({ message: "Consultation request sent", doctor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

/**
 * ✅ Doctor finishes consultation
 * (Removes patient from queue → moves to consulted)
 */
router.patch("/doctors/:id/finish", async (req, res) => {
    try {
      const doctorId = req.params.id;
  
      const doctor = await Doctor.findById(doctorId).populate("queue").populate("consultedPatients");
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      if (!doctor.queue || doctor.queue.length === 0)
        return res.status(400).json({ message: "No patients in queue" });
  
      // Remove first patient from queue
      const finishedPatient = doctor.queue.shift();
  
      // Update doctor
      doctor.patientsInQueue = doctor.queue.length;
      doctor.consultedPatients.push(finishedPatient._id);
  
      await doctor.save();
      notifyDoctorUpdate(doctorId);
  
      res.json({
        message: "Patient consultation finished",
        finishedPatient,
        patientsInQueue: doctor.patientsInQueue,
        remainingQueue: doctor.queue,
        consultedPatients: doctor.consultedPatients
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

/**
 * ✅ Get doctor’s patient queue
 */
router.get("/doctors/:id/queue", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("patientsQueue")
      .populate("consultedPatients");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({
      patientsInQueue: doctor.patientsInQueue,
      patientsQueue: doctor.patientsQueue,
      consultedPatients: doctor.consultedPatients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// GET current ongoing appointment for a patient
router.get("/:patientId/appointment", async (req, res) => {
  try {
    const { patientId } = req.params;

    // check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // check if patient is in any doctor's queue
    const doctor = await Doctor.findOne({ queue: patientId }).select(
      "name specialization queue patientsInQueue"
    );

    if (!doctor) {
      return res.json({ ongoing: false, message: "No active appointment found" });
    }

    return res.json({
      ongoing: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        patientsInQueue: doctor.patientsInQueue,
      },
      patient: {
        id: patient._id,
        name: patient.name,
      },
    });
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
