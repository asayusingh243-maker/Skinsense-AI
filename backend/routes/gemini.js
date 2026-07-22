const express = require("express");

const router = express.Router();

const {
  analyzeSkin,
} = require("../controllers/geminiController");

router.post("/analyze", analyzeSkin);

module.exports = router;