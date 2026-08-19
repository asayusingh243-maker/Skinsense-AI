const express = require("express");

const {
  getLatestProgress,
  getProgressHistory,
} = require("../controllers/progressController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/latest",
  protect,
  getLatestProgress
);

router.get(
  "/history",
  protect,
  getProgressHistory
);

module.exports = router;