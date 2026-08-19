/**
 * SkinSense AI
 * Assessment Reconciliation Service
 *
 * Purpose:
 * 1. Keep visual AI findings separate from questionnaire answers.
 * 2. Detect meaningful disagreements.
 * 3. Produce a cautious final skin assessment.
 * 4. Explain how the final result was reached.
 *
 * This service does not diagnose medical conditions.
 */

const UNCERTAIN_VALUES = new Set([
  "",
  "unknown",
  "uncertain",
  "not sure",
  "not known",
  "unable to determine",
  "unable to estimate",
  "not available",
  "n/a",
  "none selected",
]);

const SKIN_TYPE_KEYWORDS = {
  oily: ["oily", "greasy", "shiny", "excess oil", "high oil"],
  dry: ["dry", "tight", "flaky", "rough", "low hydration"],
  combination: [
    "combination",
    "oily t-zone",
    "t-zone",
    "dry cheeks",
    "mixed",
  ],
  normal: ["normal", "balanced"],
  sensitive: [
    "sensitive",
    "easily irritated",
    "irritation",
    "burning",
    "stinging",
    "redness",
  ],
};

const LEVEL_KEYWORDS = {
  low: ["low", "little", "rarely", "minimal", "none"],
  moderate: ["moderate", "medium", "sometimes", "occasional"],
  high: [
    "high",
    "very",
    "often",
    "frequent",
    "excessive",
    "severe",
    "always",
  ],
};

const SEVERITY_ORDER = {
  none: 0,
  mild: 1,
  moderate: 2,
  high: 3,
  uncertain: -1,
};

/**
 * Convert any supported value into normalized text.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Convert text into title case for display.
 *
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
function toDisplayText(value, fallback = "Not reported") {
  const text = String(value ?? "").trim();

  if (!text) {
    return fallback;
  }

  return text
    .split(/\s+/)
    .map((word) => {
      if (!word) {
        return "";
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Check whether a value is missing or too uncertain to compare.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isUncertain(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return true;
  }

  if (UNCERTAIN_VALUES.has(normalized)) {
    return true;
  }

  return (
    normalized.includes("unable to") ||
    normalized.includes("cannot determine") ||
    normalized.includes("not clearly visible")
  );
}

/**
 * Find a category by matching known keywords.
 *
 * @param {unknown} value
 * @param {Record<string, string[]>} dictionary
 * @returns {string}
 */
function classifyByKeywords(value, dictionary) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "uncertain";
  }

  for (const [category, keywords] of Object.entries(dictionary)) {
    if (
      keywords.some((keyword) =>
        normalized.includes(normalizeText(keyword))
      )
    ) {
      return category;
    }
  }

  return normalized;
}

/**
 * Normalize visual or reported skin type.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeSkinType(value) {
  return classifyByKeywords(value, SKIN_TYPE_KEYWORDS);
}

/**
 * Normalize low, moderate and high style values.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeLevel(value) {
  return classifyByKeywords(value, LEVEL_KEYWORDS);
}

/**
 * Normalize concern severity.
 *
 * @param {unknown} value
 * @returns {"none"|"mild"|"moderate"|"high"|"uncertain"}
 */
function normalizeSeverity(value) {
  const normalized = normalizeText(value);

  if (!normalized || isUncertain(normalized)) {
    return "uncertain";
  }

  if (
    normalized.includes("no concern") ||
    normalized.includes("none") ||
    normalized.includes("clear")
  ) {
    if (
      normalized.includes("no clear") ||
      normalized.includes("none")
    ) {
      return "none";
    }
  }

  if (
    normalized.includes("high") ||
    normalized.includes("severe") ||
    normalized.includes("significant")
  ) {
    return "high";
  }

  if (
    normalized.includes("moderate") ||
    normalized.includes("medium")
  ) {
    return "moderate";
  }

  if (
    normalized.includes("mild") ||
    normalized.includes("low") ||
    normalized.includes("slight")
  ) {
    return "mild";
  }

  if (
    normalized === "yes" ||
    normalized.includes("present") ||
    normalized.includes("visible")
  ) {
    return "mild";
  }

  if (
    normalized === "no" ||
    normalized.includes("not present")
  ) {
    return "none";
  }

  return "uncertain";
}

/**
 * Convert questionnaire skin-feeling answer into a reported skin type.
 *
 * @param {unknown} skinFeeling
 * @param {unknown} oiliness
 * @returns {string}
 */
function inferReportedSkinType(skinFeeling, oiliness) {
  const feeling = normalizeText(skinFeeling);
  const oil = normalizeText(oiliness);

  if (!feeling && !oil) {
    return "uncertain";
  }

  const mentionsDryness =
    feeling.includes("dry") ||
    feeling.includes("tight") ||
    feeling.includes("flaky") ||
    feeling.includes("rough");

  const mentionsOiliness =
    feeling.includes("oily") ||
    feeling.includes("greasy") ||
    feeling.includes("shiny") ||
    oil.includes("high") ||
    oil.includes("very") ||
    oil.includes("oily");

  const mentionsMixed =
    feeling.includes("combination") ||
    feeling.includes("t-zone") ||
    feeling.includes("mixed") ||
    (mentionsDryness && mentionsOiliness);

  const mentionsBalanced =
    feeling.includes("normal") ||
    feeling.includes("balanced") ||
    feeling.includes("comfortable");

  if (mentionsMixed) {
    return "combination";
  }

  if (mentionsOiliness) {
    return "oily";
  }

  if (mentionsDryness) {
    return "dry";
  }

  if (mentionsBalanced) {
    return "normal";
  }

  return normalizeSkinType(skinFeeling);
}

/**
 * Convert questionnaire sensitivity answer to a normalized level.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeReportedSensitivity(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "uncertain";
  }

  if (
    normalized === "yes" ||
    normalized.includes("very sensitive") ||
    normalized.includes("often") ||
    normalized.includes("frequent")
  ) {
    return "high";
  }

  if (
    normalized.includes("sometimes") ||
    normalized.includes("occasionally") ||
    normalized.includes("moderate")
  ) {
    return "moderate";
  }

  if (
    normalized === "no" ||
    normalized.includes("not sensitive") ||
    normalized.includes("rarely")
  ) {
    return "low";
  }

  return normalizeLevel(value);
}

/**
 * Convert questionnaire concern answer to severity.
 *
 * @param {unknown} value
 * @returns {"none"|"mild"|"moderate"|"high"|"uncertain"}
 */
function normalizeReportedConcern(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "uncertain";
  }

  if (
    normalized === "no" ||
    normalized.includes("none") ||
    normalized.includes("never")
  ) {
    return "none";
  }

  if (
    normalized.includes("severe") ||
    normalized.includes("high") ||
    normalized.includes("a lot")
  ) {
    return "high";
  }

  if (
    normalized.includes("moderate") ||
    normalized.includes("sometimes")
  ) {
    return "moderate";
  }

  if (
    normalized === "yes" ||
    normalized.includes("mild") ||
    normalized.includes("few") ||
    normalized.includes("occasionally")
  ) {
    return "mild";
  }

  return normalizeSeverity(value);
}

/**
 * Extract the user's self-reported assessment from questionnaire data.
 *
 * @param {object} questionnaire
 * @returns {object}
 */
function extractReportedAssessment(questionnaire = {}) {
  return {
    skinType: inferReportedSkinType(
      questionnaire.skinFeeling,
      questionnaire.oiliness
    ),

    skinFeeling:
      String(questionnaire.skinFeeling || "").trim() ||
      "Not reported",

    oiliness: normalizeLevel(questionnaire.oiliness),

    sensitivity: normalizeReportedSensitivity(
      questionnaire.sensitiveSkin
    ),

    concerns: {
      acne: normalizeReportedConcern(questionnaire.acne),
      pigmentation: normalizeReportedConcern(
        questionnaire.pigmentation
      ),
      pores: normalizeReportedConcern(questionnaire.pores),
    },

    context: {
      faceWash:
        String(questionnaire.faceWash || "").trim() ||
        "Not reported",

      makeupUsage:
        String(questionnaire.makeupUsage || "").trim() ||
        "Not reported",

      sunExposure:
        String(questionnaire.sunExposure || "").trim() ||
        "Not reported",

      sunscreen:
        String(questionnaire.sunscreen || "").trim() ||
        "Not reported",

      routine:
        String(questionnaire.routine || "").trim() ||
        "Not reported",

      sleep:
        String(questionnaire.sleep || "").trim() ||
        "Not reported",

      water:
        String(questionnaire.water || "").trim() ||
        "Not reported",

      stress:
        String(questionnaire.stress || "").trim() ||
        "Not reported",

      exercise:
        String(questionnaire.exercise || "").trim() ||
        "Not reported",
    },
  };
}

/**
 * Extract normalized visual findings from Gemini image analysis.
 *
 * @param {object} visualAnalysis
 * @returns {object}
 */
function extractVisualAssessment(visualAnalysis = {}) {
  const concernSeverity =
    visualAnalysis.concernSeverity || {};

  return {
    skinType: normalizeSkinType(
      visualAnalysis.skinType
    ),

    skinTone:
      String(visualAnalysis.skinTone || "").trim() ||
      "Uncertain",

    undertone:
      String(visualAnalysis.undertone || "").trim() ||
      "Uncertain",

    hydration: normalizeLevel(
      visualAnalysis.hydration
    ),

    oiliness: normalizeLevel(
      visualAnalysis.oiliness
    ),

    sensitivity: normalizeLevel(
      visualAnalysis.sensitivity
    ),

    barrierCondition:
      String(
        visualAnalysis.barrierCondition || "Uncertain"
      ).trim(),

    concerns: {
      acne: normalizeSeverity(
        concernSeverity.acne || visualAnalysis.acne
      ),

      pigmentation: normalizeSeverity(
        concernSeverity.pigmentation ||
          visualAnalysis.pigmentation
      ),

      pores: normalizeSeverity(
        concernSeverity.pores || visualAnalysis.pores
      ),

      dehydration: normalizeSeverity(
        concernSeverity.dehydration ||
          visualAnalysis.hydration
      ),

      oiliness: normalizeSeverity(
        concernSeverity.oiliness ||
          visualAnalysis.oiliness
      ),

      sensitivity: normalizeSeverity(
        concernSeverity.sensitivity ||
          visualAnalysis.sensitivity
      ),

      fineLines: normalizeSeverity(
        concernSeverity.fineLines ||
          visualAnalysis.fineLines
      ),
    },

    skinScore:
      Number.isFinite(Number(visualAnalysis.skinScore))
        ? Number(visualAnalysis.skinScore)
        : 0,

    mainConcerns: Array.isArray(
      visualAnalysis.mainConcerns
    )
      ? visualAnalysis.mainConcerns
      : [],

    analysisNotes: Array.isArray(
      visualAnalysis.analysisNotes
    )
      ? visualAnalysis.analysisNotes
      : [],
  };
}

/**
 * Determine whether two normalized values meaningfully disagree.
 *
 * @param {unknown} visualValue
 * @param {unknown} reportedValue
 * @returns {boolean}
 */
function valuesConflict(visualValue, reportedValue) {
  if (
    isUncertain(visualValue) ||
    isUncertain(reportedValue)
  ) {
    return false;
  }

  return (
    normalizeText(visualValue) !==
    normalizeText(reportedValue)
  );
}

/**
 * Add one conflict record when values disagree.
 *
 * @param {object[]} conflicts
 * @param {string} field
 * @param {unknown} visualValue
 * @param {unknown} reportedValue
 * @param {string} explanation
 */
function addConflict(
  conflicts,
  field,
  visualValue,
  reportedValue,
  explanation
) {
  if (!valuesConflict(visualValue, reportedValue)) {
    return;
  }

  conflicts.push({
    field,
    visualValue: toDisplayText(
      visualValue,
      "Uncertain"
    ),
    reportedValue: toDisplayText(
      reportedValue,
      "Not reported"
    ),
    explanation,
  });
}

/**
 * Detect conflicts between visual observations and questionnaire answers.
 *
 * @param {object} visual
 * @param {object} reported
 * @returns {object[]}
 */
function detectConflicts(visual, reported) {
  const conflicts = [];

  addConflict(
    conflicts,
    "skinType",
    visual.skinType,
    reported.skinType,
    "The visual skin-type estimate differs from the user's reported skin experience."
  );

  addConflict(
    conflicts,
    "oiliness",
    visual.oiliness,
    reported.oiliness,
    "Visible oiliness differs from the oiliness reported in the questionnaire."
  );

  addConflict(
    conflicts,
    "sensitivity",
    visual.sensitivity,
    reported.sensitivity,
    "Visible sensitivity signs differ from the user's reported sensitivity. Reported reactions are important because sensitivity cannot always be seen in a photograph."
  );

  addConflict(
    conflicts,
    "acne",
    visual.concerns.acne,
    reported.concerns.acne,
    "Visible acne severity differs from the user's reported acne experience."
  );

  addConflict(
    conflicts,
    "pigmentation",
    visual.concerns.pigmentation,
    reported.concerns.pigmentation,
    "Visible uneven tone differs from the pigmentation concern reported by the user."
  );

  addConflict(
    conflicts,
    "pores",
    visual.concerns.pores,
    reported.concerns.pores,
    "Visible pore appearance differs from the user's reported concern."
  );

  return conflicts;
}

/**
 * Select the more cautious concern severity.
 *
 * For concerns, the higher severity is retained so that reported symptoms
 * are not ignored merely because they are difficult to see in one photo.
 *
 * @param {string} visualSeverity
 * @param {string} reportedSeverity
 * @returns {string}
 */
function chooseConcernSeverity(
  visualSeverity,
  reportedSeverity
) {
  const visualRank =
    SEVERITY_ORDER[visualSeverity] ?? -1;

  const reportedRank =
    SEVERITY_ORDER[reportedSeverity] ?? -1;

  if (visualRank === -1 && reportedRank === -1) {
    return "uncertain";
  }

  if (visualRank >= reportedRank) {
    return visualSeverity;
  }

  return reportedSeverity;
}

/**
 * Produce the final skin-type conclusion.
 *
 * @param {string} visualType
 * @param {string} reportedType
 * @param {object} visual
 * @param {object} reported
 * @returns {string}
 */
function determineFinalSkinType(
  visualType,
  reportedType,
  visual,
  reported
) {
  const visualKnown = !isUncertain(visualType);
  const reportedKnown = !isUncertain(reportedType);

  if (visualKnown && !reportedKnown) {
    return visualType;
  }

  if (!visualKnown && reportedKnown) {
    return reportedType;
  }

  if (!visualKnown && !reportedKnown) {
    return "uncertain";
  }

  if (visualType === reportedType) {
    return visualType;
  }

  const types = new Set([
    visualType,
    reportedType,
  ]);

  if (
    types.has("oily") &&
    types.has("dry")
  ) {
    return "combination";
  }

  if (
    types.has("combination") &&
    types.has("dry")
  ) {
    return "combination-dehydrated";
  }

  if (
    types.has("combination") &&
    types.has("oily")
  ) {
    return "combination-oily";
  }

  if (
    visual.hydration === "low" &&
    (visualType === "oily" ||
      visualType === "combination")
  ) {
    return "combination-dehydrated";
  }

  if (
    reported.skinFeeling
      .toLowerCase()
      .includes("tight") &&
    (visualType === "oily" ||
      visualType === "combination")
  ) {
    return "combination-dehydrated";
  }

  /*
   * Prefer visual skin type for visible oil distribution,
   * but keep reported experience in explanations.
   */
  return visualType;
}

/**
 * Determine final sensitivity.
 *
 * Questionnaire sensitivity receives more weight because burning,
 * stinging and delayed reactions may not be visible in a photograph.
 *
 * @param {string} visualSensitivity
 * @param {string} reportedSensitivity
 * @returns {string}
 */
function determineFinalSensitivity(
  visualSensitivity,
  reportedSensitivity
) {
  if (!isUncertain(reportedSensitivity)) {
    return reportedSensitivity;
  }

  if (!isUncertain(visualSensitivity)) {
    return visualSensitivity;
  }

  return "uncertain";
}

/**
 * Estimate assessment confidence.
 *
 * @param {object} visual
 * @param {object} reported
 * @param {object[]} conflicts
 * @returns {"low"|"medium"|"high"}
 */
function calculateConfidence(
  visual,
  reported,
  conflicts
) {
  let score = 0;

  if (!isUncertain(visual.skinType)) {
    score += 2;
  }

  if (!isUncertain(reported.skinType)) {
    score += 1;
  }

  if (!isUncertain(visual.oiliness)) {
    score += 1;
  }

  if (!isUncertain(visual.hydration)) {
    score += 1;
  }

  if (!isUncertain(reported.sensitivity)) {
    score += 1;
  }

  if (
    Array.isArray(visual.analysisNotes) &&
    visual.analysisNotes.length > 0
  ) {
    const limitationText = visual.analysisNotes
      .join(" ")
      .toLowerCase();

    if (
      limitationText.includes("blur") ||
      limitationText.includes("lighting") ||
      limitationText.includes("makeup") ||
      limitationText.includes("angle") ||
      limitationText.includes("uncertain") ||
      limitationText.includes("image quality")
    ) {
      score -= 2;
    }
  }

  if (conflicts.length >= 4) {
    score -= 2;
  } else if (conflicts.length >= 2) {
    score -= 1;
  }

  if (score >= 5 && conflicts.length <= 1) {
    return "high";
  }

  if (score >= 2) {
    return "medium";
  }

  return "low";
}

/**
 * Create user-friendly explanations for the final result.
 *
 * @param {object} visual
 * @param {object} reported
 * @param {object} finalAssessment
 * @param {object[]} conflicts
 * @returns {string[]}
 */
function buildExplanation(
  visual,
  reported,
  finalAssessment,
  conflicts
) {
  const explanations = [];

  if (!isUncertain(visual.skinType)) {
    explanations.push(
      `The uploaded image visually suggests ${toDisplayText(
        visual.skinType
      )} skin.`
    );
  } else {
    explanations.push(
      "The image did not provide a reliable visual skin-type estimate."
    );
  }

  if (!isUncertain(reported.skinType)) {
    explanations.push(
      `Your questionnaire responses suggest ${toDisplayText(
        reported.skinType
      )} skin based on how your skin feels and behaves.`
    );
  }

  if (conflicts.length > 0) {
    explanations.push(
      `${conflicts.length} difference${
        conflicts.length === 1 ? "" : "s"
      } were detected between the image observations and your questionnaire answers.`
    );
  } else {
    explanations.push(
      "The image observations and your questionnaire answers generally support each other."
    );
  }

  explanations.push(
    `The final assessment is ${toDisplayText(
      finalAssessment.skinType
    )} with ${finalAssessment.confidence} confidence.`
  );

  if (
    finalAssessment.skinType ===
    "combination-dehydrated"
  ) {
    explanations.push(
      "This means the skin may produce oil in some areas while still lacking sufficient hydration or feeling tight."
    );
  }

  if (
    finalAssessment.sensitivity === "high" ||
    finalAssessment.sensitivity === "moderate"
  ) {
    explanations.push(
      "Reported sensitivity was given extra importance because irritation, burning or delayed reactions may not be visible in a photograph."
    );
  }

  return explanations;
}

/**
 * Build the final combined assessment used by later pipeline stages.
 *
 * @param {object} visual
 * @param {object} reported
 * @param {object[]} conflicts
 * @returns {object}
 */
function buildFinalAssessment(
  visual,
  reported,
  conflicts
) {
  const finalAssessment = {
    skinType: determineFinalSkinType(
      visual.skinType,
      reported.skinType,
      visual,
      reported
    ),

    skinTone: visual.skinTone,
    undertone: visual.undertone,

    hydration: !isUncertain(visual.hydration)
      ? visual.hydration
      : "uncertain",

    oiliness: !isUncertain(visual.oiliness)
      ? visual.oiliness
      : reported.oiliness,

    sensitivity: determineFinalSensitivity(
      visual.sensitivity,
      reported.sensitivity
    ),

    barrierCondition: visual.barrierCondition,

    concerns: {
      acne: chooseConcernSeverity(
        visual.concerns.acne,
        reported.concerns.acne
      ),

      pigmentation: chooseConcernSeverity(
        visual.concerns.pigmentation,
        reported.concerns.pigmentation
      ),

      pores: chooseConcernSeverity(
        visual.concerns.pores,
        reported.concerns.pores
      ),

      dehydration:
        visual.concerns.dehydration,

      oiliness:
        visual.concerns.oiliness,

      sensitivity: chooseConcernSeverity(
        visual.concerns.sensitivity,
        reported.sensitivity === "high"
          ? "high"
          : reported.sensitivity === "moderate"
          ? "moderate"
          : reported.sensitivity === "low"
          ? "none"
          : "uncertain"
      ),

      fineLines:
        visual.concerns.fineLines,
    },

    mainConcerns: visual.mainConcerns,
    skinScore: visual.skinScore,

    conflictDetected: conflicts.length > 0,
    conflictCount: conflicts.length,

    confidence: "low",
    explanation: [],
  };

  finalAssessment.confidence =
    calculateConfidence(
      visual,
      reported,
      conflicts
    );

  finalAssessment.explanation =
    buildExplanation(
      visual,
      reported,
      finalAssessment,
      conflicts
    );

  return finalAssessment;
}

/**
 * Convert the reconciliation result back into the familiar analysis shape.
 *
 * This preserves compatibility with routineBuilder, productSelector
 * and the existing frontend while also exposing the detailed assessment.
 *
 * @param {object} visualAnalysis
 * @param {object} finalAssessment
 * @returns {object}
 */
function buildCompatibleAnalysis(
  visualAnalysis,
  finalAssessment
) {
  return {
    ...visualAnalysis,

    skinType: toDisplayText(
      finalAssessment.skinType,
      "Uncertain"
    ),

    skinTone:
      finalAssessment.skinTone ||
      visualAnalysis.skinTone ||
      "Uncertain",

    undertone:
      finalAssessment.undertone ||
      visualAnalysis.undertone ||
      "Uncertain",

    hydration: toDisplayText(
      finalAssessment.hydration,
      visualAnalysis.hydration || "Uncertain"
    ),

    oiliness: toDisplayText(
      finalAssessment.oiliness,
      visualAnalysis.oiliness || "Uncertain"
    ),

    sensitivity: toDisplayText(
      finalAssessment.sensitivity,
      visualAnalysis.sensitivity || "Uncertain"
    ),

    barrierCondition:
      finalAssessment.barrierCondition ||
      visualAnalysis.barrierCondition ||
      "Uncertain",

    concernSeverity: {
      ...(visualAnalysis.concernSeverity || {}),
      ...finalAssessment.concerns,
    },

    assessmentConfidence:
      finalAssessment.confidence,

    conflictDetected:
      finalAssessment.conflictDetected,

    conflictCount:
      finalAssessment.conflictCount,
  };
}

/**
 * Main service function.
 *
 * @param {object} input
 * @param {object} input.visualAnalysis Gemini image-only result.
 * @param {object} input.questionnaire User questionnaire.
 * @returns {object}
 */
function reconcileAssessment({
  visualAnalysis,
  questionnaire,
}) {
  if (
    !visualAnalysis ||
    typeof visualAnalysis !== "object"
  ) {
    throw new Error(
      "A valid visual skin analysis is required for reconciliation."
    );
  }

  if (
    !questionnaire ||
    typeof questionnaire !== "object"
  ) {
    throw new Error(
      "Valid questionnaire data is required for reconciliation."
    );
  }

  const visualAssessment =
    extractVisualAssessment(visualAnalysis);

  const reportedAssessment =
    extractReportedAssessment(questionnaire);

  const conflicts = detectConflicts(
    visualAssessment,
    reportedAssessment
  );

  const finalAssessment =
    buildFinalAssessment(
      visualAssessment,
      reportedAssessment,
      conflicts
    );

  const combinedAnalysis =
    buildCompatibleAnalysis(
      visualAnalysis,
      finalAssessment
    );

  return {
    visualAssessment,
    reportedAssessment,
    finalAssessment,
    conflicts,
    combinedAnalysis,
  };
}

module.exports = {
  reconcileAssessment,
  extractVisualAssessment,
  extractReportedAssessment,
  detectConflicts,
  buildFinalAssessment,
  buildCompatibleAnalysis,
  normalizeSkinType,
  normalizeLevel,
  normalizeSeverity,
};