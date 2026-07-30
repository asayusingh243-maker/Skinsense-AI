const express = require("express");

const router = express.Router();

const {
  analyzeSkin,
} = require("../controllers/geminiController");

const {
  protect,
} = require("../middleware/authMiddleware");

/*
 * A user must be logged in before running an analysis.
 * This allows the completed scan to be connected to
 * the correct MongoDB user account.
 */
router.post(
  "/analyze",
  protect,
  analyzeSkin
);

module.exports = router;