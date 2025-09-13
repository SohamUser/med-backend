import express from "express";
import MedicalStore from "../models/MedicalStore.js";
import Prescription from "../models/Prescription.js"; // your prescription model

const router = express.Router();

// ✅ Find nearby stores with prescription medicines
router.post("/stores/check-availability", async (req, res) => {
  try {
    const { prescriptionId, lat, lng } = req.body;

    if (!prescriptionId || !lat || !lng) {
      return res.status(400).json({ message: "PrescriptionId and location required" });
    }

    // 1. Fetch prescription with medicines
    const prescription = await Prescription.findById(prescriptionId).populate("medicines");
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    const requiredMedicines = prescription.medicines.map((m) => m.name);

    // 2. Find nearby stores (within 5km for example)
    const stores = await MedicalStore.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000 // 5km
        }
      }
    });

    // 3. Check availability
    const result = stores.map((store) => {
      const available = [];
      const missing = [];

      requiredMedicines.forEach((med) => {
        const found = store.medicines.find((m) => m.name.toLowerCase() === med.toLowerCase() && m.stock > 0);
        if (found) {
          available.push({ name: found.name, stock: found.stock, price: found.price });
        } else {
          missing.push(med);
        }
      });

      return {
        storeName: store.storeName,
        phone: store.phone,
        address: store.address,
        location: store.location,
        available,
        missing
      };
    });

    res.json({ stores: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
