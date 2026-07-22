const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/", (req, res) => {
  res.send("Auth Route Working ✅");
});

module.exports = router;