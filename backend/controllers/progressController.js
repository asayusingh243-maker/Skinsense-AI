const {
  getLatestProgressForUser,
} = require("../services/progressService");

const getLatestProgress = async (req, res) => {
  try {
    const progress =
      await getLatestProgressForUser(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error(
      "Progress controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate skin progress.",
    });
  }
};

module.exports = {
  getLatestProgress,
};