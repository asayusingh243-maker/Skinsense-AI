const SkinAnalysis =
  require("../models/SkinAnalysis");

function getValue(
  scan,
  paths,
  fallback = "Unknown"
) {
  for (const path of paths) {
    const parts = path.split(".");

    let current = scan;

    for (const part of parts) {
      current = current?.[part];

      if (
        current === undefined ||
        current === null
      ) {
        break;
      }
    }

    if (
      current !== undefined &&
      current !== null &&
      current !== ""
    ) {
      return current;
    }
  }

  return fallback;
}

async function getProgressHistoryForUser(
  userId,
  limit = 30
) {
  const scans =
    await SkinAnalysis.find({
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
      Number(scan.skinScore) ||
      Number(
        scan.finalAssessment?.skinScore
      ) ||
      Number(
        scan.assessment?.skinScore
      ) ||
      null,

    skinType: getValue(
      scan,
      [
        "finalAssessment.skinType",
        "assessment.skinType",
        "visualAssessment.skinType",
        "skinType",
      ]
    ),

    hydration: getValue(
      scan,
      [
        "finalAssessment.hydration",
        "assessment.hydration",
        "visualAssessment.hydration",
      ]
    ),

    oiliness: getValue(
      scan,
      [
        "finalAssessment.oiliness",
        "assessment.oiliness",
        "visualAssessment.oiliness",
      ]
    ),

    sensitivity: getValue(
      scan,
      [
        "finalAssessment.sensitivity",
        "assessment.sensitivity",
        "visualAssessment.sensitivity",
      ]
    ),

    acne: getValue(
      scan,
      [
        "finalAssessment.concerns.acne",
        "assessment.concerns.acne",
        "visualAssessment.acne",
        "questionnaire.acne",
      ]
    ),

    pigmentation: getValue(
      scan,
      [
        "finalAssessment.concerns.pigmentation",
        "assessment.concerns.pigmentation",
        "visualAssessment.pigmentation",
        "questionnaire.pigmentation",
      ]
    ),

    pores: getValue(
      scan,
      [
        "finalAssessment.concerns.pores",
        "assessment.concerns.pores",
        "visualAssessment.pores",
        "questionnaire.pores",
      ]
    ),

    image:
      scan.imageUrl ||
      scan.image?.url ||
      scan.image?.path ||
      scan.image ||
      scan.photo ||
      null,
  }));
}

module.exports = {
  getProgressHistoryForUser,
};