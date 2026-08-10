const {
  getLatestAnalysisForUser,
} = require("../services/latestAnalysisService");

const getLatestAnalysis = async (req, res) => {
  try {
    const analysis =
      await getLatestAnalysisForUser(
        req.user._id
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message:
          "No saved skin analysis was found. Complete your first scan to continue.",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error(
      "Latest analysis controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load the latest skin analysis.",
    });
  }
};

module.exports = {
  getLatestAnalysis,
};