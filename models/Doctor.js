import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  patientsInQueue: { type: Number, default: 0 },
  queue: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
  consultedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
