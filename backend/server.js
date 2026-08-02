const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();


const connectDB = require("./config/db");

const analysisRoutes = require("./routes/analysis");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const geminiRoutes = require("./routes/gemini");
const dashboardRoutes = require("./routes/dashboard");
const path = require("path");
const environmentRoutes =
  require("./routes/environment");


const app = express();


// Connect to MongoDB
connectDB();

/*
  Allow the frontend to send and receive authentication cookies.

  FRONTEND_URL can later contain your deployed frontend address.
  Localhost ports 3000 and 3001 are allowed for development.
*/
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin, such as Postman.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked request from: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON and form request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Parse cookies such as skinsense_token
app.use(cookieParser());


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/gemini", geminiRoutes);
app.use("/api/analysis", analysisRoutes);


app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/dashboard", dashboardRoutes);
app.use(
  "/api/environment",
  environmentRoutes

);

app.use(
  "/api/analysis",
  analysisRoutes
);

// Backend status route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkinSense AI backend is running",
  });
});

// Handle CORS and other server errors
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(500).json({
    success: false,
    message:
      error.message.startsWith("CORS blocked")
        ? error.message
        : "An internal server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});