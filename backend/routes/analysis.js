const express = require("express");

const {
  getLatestAnalysis,
} = require("../controllers/analysisController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/latest",
  protect,
  getLatestAnalysis
);

module.exports = router;