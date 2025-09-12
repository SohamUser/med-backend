import express from "express";
import cors from "cors";

const app = express();
app.use(cors()); // allow requests from React Native

// Simple GET route
app.get("/", (req, res) => {
  res.json({ message: "Hello from backend 👋" });
});

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
