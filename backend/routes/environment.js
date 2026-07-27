const express = require("express");

const {
  getEnvironment,
} = require("../controllers/environmentController");

const router = express.Router();

router.post("/", getEnvironment);

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Environment route working",
  });
});

module.exports = router;
