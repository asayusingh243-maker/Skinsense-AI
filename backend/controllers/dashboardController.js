const { getDashboardData } = require("../services/dashboardService");

const getDashboard = async (req, res) => {
  try {
    const dashboardData = await getDashboardData(req.user);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard controller error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
};

module.exports = {
  getDashboard,
};