const express = require("express");

const {
  getLatestProgress,
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

module.exports = router;