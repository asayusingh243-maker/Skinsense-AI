const SkinAnalysis = require("../models/SkinAnalysis");

const getDashboardData = async (user) => {
  const scans = await SkinAnalysis.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const latestScan = scans[0] || null;
  const previousScan = scans[1] || null;

  const latestScore =
    latestScan?.skinScore ??
    latestScan?.finalAssessment?.skinScore ??
    latestScan?.assessment?.skinScore ??
    0;

  const previousScore =
    previousScan?.skinScore ??
    previousScan?.finalAssessment?.skinScore ??
    previousScan?.assessment?.skinScore ??
    0;

  const scoreChange = previousScan ? latestScore - previousScore : 0;

  let direction = "stable";

  if (scoreChange > 0) {
    direction = "improved";
  } else if (scoreChange < 0) {
    direction = "declined";
  }

  const insights = [];

  const finalAssessment =
    latestScan?.finalAssessment || latestScan?.assessment || {};

  if (finalAssessment.hydration) {
    insights.push(`Hydration status: ${finalAssessment.hydration}`);
  }

  if (finalAssessment.oiliness) {
    insights.push(`Oiliness level: ${finalAssessment.oiliness}`);
  }

  if (finalAssessment.pigmentation) {
    insights.push(`Pigmentation status: ${finalAssessment.pigmentation}`);
  }

  if (insights.length === 0 && latestScan) {
    insights.push("Your latest skin analysis is available.");
  }

  if (!latestScan) {
    insights.push("Complete your first skin scan to receive personalized insights.");
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },

    hero: {
  image:
    latestScan?.imageUrl ||
    latestScan?.image ||
    latestScan?.photo ||
    null,

  skinScore: latestScore,

  skinType:
    finalAssessment?.skinType ||
    latestScan?.visualAssessment?.skinType ||
    "Not available",

  skinTone:
    finalAssessment?.skinTone ||
    latestScan?.visualAssessment?.skinTone ||
    "Not available",

  budget:
    latestScan?.pipeline?.budget?.totalBudget ||
    latestScan?.budget?.totalBudget ||
    latestScan?.questionnaire?.budget ||
    0,

  weather:
    latestScan?.pipeline?.weather?.summary ||
    latestScan?.weather?.summary ||
    "Not available",

  lastScan: latestScan?.createdAt || null,

  change: scoreChange,

  direction,
},

    todayInsight: insights,

    quickStats: {
      totalScans: await SkinAnalysis.countDocuments({
        user: user._id,
      }),

      routineCompletion: 0,

      currentStreak: 0,
    },

    recentScans: scans.map((scan) => ({
      id: scan._id,

      skinScore:
        scan.skinScore ??
        scan.finalAssessment?.skinScore ??
        scan.assessment?.skinScore ??
        0,

      image: scan.imageUrl || scan.image || scan.photo || null,

      createdAt: scan.createdAt,
    })),
  };
};

module.exports = {
  getDashboardData,
};