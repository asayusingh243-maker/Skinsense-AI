const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} = require("../controllers/authController");

// Register a new user
router.post("/register", registerUser);

// Log in and create the authentication cookie
router.post("/login", loginUser);

// Check whether the user is currently logged in
router.get("/me", getCurrentUser);

// Clear the authentication cookie
router.post("/logout", logoutUser);

// Route status check
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route working",
  });
});

module.exports = router;