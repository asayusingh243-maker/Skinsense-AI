const SkinAnalysis = require("../models/SkinAnalysis");

async function getProgressHistoryForUser(userId, limit = 30) {
  const scans = await SkinAnalysis.find({
    user: userId,
  })
    .sort({
      createdAt: 1,
    })
    .limit(limit)
    .lean();

  return scans.map((scan) => ({
    id: scan._id.toString(),
    date: scan.createdAt,

    skinScore:
      scan.skinScore ?? null,

    skinType:
      scan.finalAssessment?.skinType ||
      scan.skinType ||
      "Unknown",

    hydration:
      scan.finalAssessment?.hydration ||
      scan.visualAssessment?.hydration ||
      "Unknown",

    oiliness:
      scan.finalAssessment?.oiliness ||
      scan.visualAssessment?.oiliness ||
      "Unknown",

    sensitivity:
      scan.finalAssessment?.sensitivity ||
      scan.visualAssessment?.sensitivity ||
      "Unknown",

    acne:
      scan.finalAssessment?.concerns?.acne ||
      "Unknown",

    pigmentation:
      scan.finalAssessment?.concerns
        ?.pigmentation ||
      "Unknown",

    pores:
      scan.finalAssessment?.concerns?.pores ||
      "Unknown",

    image:
      scan.image?.path ||
      scan.image?.url ||
      null,
  }));
}

module.exports = {
  getProgressHistoryForUser,
};