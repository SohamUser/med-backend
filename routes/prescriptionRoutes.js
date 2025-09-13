import express from "express";
import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

const router = express.Router();

/**
 * ✅ Doctor prescribes medicine to a patient
 * Frontend: doctor clicks "Prescribe" next to patient in queue
 */
router.post("/prescribe", async (req, res) => {
  try {
    const { doctorId, patientId, medicines } = req.body;

    // Validate
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);
    if (!doctor || !patient)
      return res.status(404).json({ message: "Doctor or Patient not found" });

    // Create prescription
    const prescription = new Prescription({
      doctor: doctor._id,
      patient: patient._id,
      medicines
    });

    await prescription.save();

    res.json({ message: "Prescription sent to patient", prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Get prescriptions of a patient
 * Frontend: patient dashboard sees prescriptions
 */
router.get("/patient/:patientId", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate("doctor", "name specialization")
      .populate("patient", "name number age");

    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Get prescriptions given by a doctor
 * Frontend: doctor dashboard sees prescriptions issued
 */
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.params.doctorId })
      .populate("doctor", "name specialization")
      .populate("patient", "name number age");

    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
