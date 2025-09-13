import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  medicines: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true } // e.g., "2 pills daily"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
