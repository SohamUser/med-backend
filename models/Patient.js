import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  age: { type: Number, required: true },
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
