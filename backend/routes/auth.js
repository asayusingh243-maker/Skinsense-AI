const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");

// Register User
router.post("/register", registerUser);

// Test Route
router.get("/", (req, res) => {
  res.send("Auth Route Working ✅");
});

module.exports = router;