const express = require("express");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const cors = require("cors");
const uploadRoutes = require("./routes/upload");
const geminiRoutes = require("./routes/gemini");


const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/gemini", geminiRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 SkinSense AI Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});