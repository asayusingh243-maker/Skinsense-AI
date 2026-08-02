const SkinAnalysis = require("../models/SkinAnalysis");

function buildImageUrl(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image;
  }

  return image.path || image.url || null;
}

function formatRoutine(steps) {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step, index) => ({
    order: index + 1,
    category: step?.category || "Skincare step",
    instruction: step?.instruction || "",
    completed: Boolean(step?.completed),
  }));
}

function buildInsights(analysis) {
  const insights = [];
  const finalAssessment = analysis.finalAssessment || {};

  if (finalAssessment.skinType || analysis.skinType) {
    insights.push(
      `Your latest assessment indicates ${
        finalAssessment.skinType || analysis.skinType
      } skin.`
    );
  }

  if (finalAssessment.hydration) {
    insights.push(
      `Hydration level: ${finalAssessment.hydration}.`
    );
  }

  if (finalAssessment.oiliness) {
    insights.push(
      `Oiliness level: ${finalAssessment.oiliness}.`
    );
  }

  if (finalAssessment.sensitivity) {
    insights.push(
      `Sensitivity level: ${finalAssessment.sensitivity}.`
    );
  }

  if (analysis.progress?.direction === "improved") {
    insights.push(
      `Your skin score improved by ${analysis.progress.scoreChange} points since your previous scan.`
    );
  }

  if (analysis.progress?.direction === "declined") {
    insights.push(
      `Your skin score decreased by ${Math.abs(
        analysis.progress.scoreChange || 0
      )} points since your previous scan.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Your latest analysis is available. Continue following your personalised routine."
    );
  }

  return insights;
}

async function getLatestAnalysisForUser(userId) {
  const analysis = await SkinAnalysis.findOne({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  if (!analysis) {
    return null;
  }

  return {
    scan: {
      id: analysis._id.toString(),
      date: analysis.createdAt,
      photo: buildImageUrl(analysis.image),
      skinScore: analysis.skinScore,
      progress: analysis.progress || {
        previousSkinScore: null,
        scoreChange: null,
        direction: "first-scan",
      },
    },

    skin: {
      type:
        analysis.finalAssessment?.skinType ||
        analysis.skinType ||
        "Unknown",

      tone:
        analysis.finalAssessment?.skinTone ||
        analysis.visualAssessment?.skinTone ||
        "Unknown",

      undertone:
        analysis.finalAssessment?.undertone ||
        analysis.visualAssessment?.undertone ||
        "Unknown",

      hydration:
        analysis.finalAssessment?.hydration ||
        analysis.visualAssessment?.hydration ||
        "Unknown",

      oiliness:
        analysis.finalAssessment?.oiliness ||
        analysis.visualAssessment?.oiliness ||
        "Unknown",

      sensitivity:
        analysis.finalAssessment?.sensitivity ||
        analysis.visualAssessment?.sensitivity ||
        "Unknown",

      concerns: analysis.concerns || [],
    },

    assessment: {
      visual: analysis.visualAssessment || {},
      reported: analysis.reportedAssessment || {},
      final: analysis.finalAssessment || {},
      conflicts: analysis.conflicts || [],
    },

    routine: {
      morning: formatRoutine(
        analysis.morningRoutine
      ),
      night: formatRoutine(
        analysis.nightRoutine
      ),
      weekly: formatRoutine(
        analysis.weeklyRoutine
      ),
    },

    products: analysis.products || [],

    budget: {
      detectedBudget:
        analysis.detectedBudget,
      routineTotal:
        analysis.routineTotal || 0,
      status:
        analysis.budgetStatus || "",
    },

    weather: analysis.weather || {},
    safety: analysis.safety || {},
    questionnaire:
      analysis.questionnaire || {},
    insights: buildInsights(analysis),

    metadata: {
      analysisVersion:
        analysis.analysisVersion || "2.0",
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    },
  };
}

module.exports = {
  getLatestAnalysisForUser,
};