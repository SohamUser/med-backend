import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosageForm: { type: String, required: true }, // e.g., Tablet, Syrup, Injection
    strength: { type: String, required: true },   // e.g., 500mg
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const medicalStoreSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    medicines: [medicineSchema],
  },
  { timestamps: true }
);

// ✅ Enable geospatial queries
medicalStoreSchema.index({ location: "2dsphere" });

const MedicalStore = mongoose.model("MedicalStore", medicalStoreSchema);

export default MedicalStore;
