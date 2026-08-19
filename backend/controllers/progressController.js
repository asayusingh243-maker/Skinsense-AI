const {
  getLatestProgressForUser,
} = require("../services/progressService");

const {
  getProgressHistoryForUser,
} = require("../services/progressHistoryService");

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


const getProgressHistory = async (req, res) => {
  try {
    const history =
      await getProgressHistoryForUser(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(
      "Progress history controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load progress history.",
    });
  }
};

module.exports = {
  getLatestProgress,
  getProgressHistory,
};