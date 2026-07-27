"use strict";

/**
 * SkinSense AI - Routine Builder
 *
 * Converts cosmetic skin-analysis data into brand-independent routine steps.
 * Product selection is intentionally handled by a separate service.
 */

const DEFAULT_FREQUENCY = {
  morning: "Every morning",
  night: "Every night",
  weekly: "Once weekly",
};

const ESSENTIAL_STEPS = {
  cleanser: {
    category: "Cleanser",
    purpose: "Remove sweat, excess oil, sunscreen, makeup and surface impurities without over-stripping the skin.",
  },
  moisturizer: {
    category: "Moisturizer",
    purpose: "Support hydration and help maintain the skin barrier.",
  },
  sunscreen: {
    category: "Sunscreen",
    purpose: "Protect the skin from ultraviolet exposure and help prevent worsening of visible pigmentation.",
  },
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createProfileText(analysis = {}, questionnaire = {}) {
  const severity = analysis.severity || analysis.concernSeverity || {};
  const severityText = Object.entries(severity)
    .map(([key, value]) => `${key} ${value}`)
    .join(" ");

  const values = [
    analysis.skinType,
    analysis.skinTone,
    analysis.undertone,
    analysis.hydration,
    analysis.hydrationLevel,
    analysis.oiliness,
    analysis.oilLevel,
    analysis.sensitivity,
    analysis.barrier,
    analysis.barrierCondition,
    analysis.acne,
    analysis.pigmentation,
    analysis.pores,
    analysis.fineLines,
    analysis.texture,
    ...normalizeStringArray(analysis.mainConcerns),
    ...normalizeStringArray(analysis.concerns),
    ...normalizeStringArray(analysis.ingredients),
    severityText,
    questionnaire.skinFeeling,
    questionnaire.acne,
    questionnaire.pigmentation,
    questionnaire.pores,
    questionnaire.sensitiveSkin,
    questionnaire.oiliness,
    questionnaire.currentRoutine,
    questionnaire.routine,
    questionnaire.pregnant,
    questionnaire.pregnancy,
    questionnaire.breastfeeding,
  ];

  return normalizeText(values.filter(Boolean).join(" "));
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function isHighSensitivity(profileText) {
  return includesAny(profileText, [
    "high sensitivity",
    "very sensitive",
    "severe sensitivity",
    "easily irritated",
    "burning",
    "stinging",
    "reactive skin",
  ]);
}

function isBarrierCompromised(profileText) {
  return includesAny(profileText, [
    "damaged barrier",
    "compromised barrier",
    "weak barrier",
    "impaired barrier",
    "barrier damaged",
    "barrier compromised",
    "peeling",
    "persistent irritation",
  ]);
}

function isPregnancyRestricted(profileText) {
  return includesAny(profileText, [
    "pregnant",
    "pregnancy",
    "breastfeeding",
    "nursing",
  ]);
}

function isBeginner(questionnaire = {}) {
  const routine = normalizeText(
    questionnaire.routine ||
      questionnaire.currentRoutine ||
      questionnaire.experience ||
      ""
  );

  return (
    !routine ||
    includesAny(routine, [
      "none",
      "no routine",
      "beginner",
      "basic",
      "just started",
      "new to skincare",
    ])
  );
}

function makeStep({
  id,
  category,
  subcategory = "",
  purpose,
  frequency,
  instructions,
  suitableFor = [],
  warnings = [],
  optional = false,
  activeGroup = "",
}) {
  return {
    id,
    step: 0,
    category,
    subcategory,
    purpose,
    frequency,
    instructions,
    suitableFor,
    warnings,
    optional,
    activeGroup,
  };
}

function addUniqueStep(collection, step) {
  const duplicate = collection.some(
    (item) =>
      item.id === step.id ||
      normalizeText(item.category) === normalizeText(step.category)
  );

  if (!duplicate) collection.push(step);
}

function buildEssentialRoutine({ skinType, profileText }) {
  const morning = [];
  const night = [];

  const cleanserSubtype = includesAny(profileText, ["dry", "dehydrated"])
    ? "Hydrating gentle cleanser"
    : includesAny(profileText, ["oily", "acne", "congested"])
      ? "Gentle gel cleanser"
      : "Gentle pH-balanced cleanser";

  const moisturizerSubtype = includesAny(profileText, ["dry", "dehydrated"])
    ? "Barrier-supporting cream moisturizer"
    : includesAny(profileText, ["oily", "humid"])
      ? "Lightweight non-comedogenic moisturizer"
      : "Balanced barrier-supporting moisturizer";

  addUniqueStep(
    morning,
    makeStep({
      id: "am-cleanser",
      category: ESSENTIAL_STEPS.cleanser.category,
      subcategory: cleanserSubtype,
      purpose: ESSENTIAL_STEPS.cleanser.purpose,
      frequency: DEFAULT_FREQUENCY.morning,
      instructions:
        "Massage gently onto damp skin for about 30 seconds, then rinse with lukewarm water. Avoid harsh scrubbing.",
      suitableFor: [skinType || "Most skin types"],
    })
  );

  addUniqueStep(
    morning,
    makeStep({
      id: "am-moisturizer",
      category: ESSENTIAL_STEPS.moisturizer.category,
      subcategory: moisturizerSubtype,
      purpose: ESSENTIAL_STEPS.moisturizer.purpose,
      frequency: DEFAULT_FREQUENCY.morning,
      instructions:
        "Apply a thin, even layer after treatment products and before sunscreen.",
      suitableFor: [skinType || "Most skin types"],
    })
  );

  addUniqueStep(
    morning,
    makeStep({
      id: "am-sunscreen",
      category: ESSENTIAL_STEPS.sunscreen.category,
      subcategory: "Broad-spectrum SPF 50 PA++++",
      purpose: ESSENTIAL_STEPS.sunscreen.purpose,
      frequency: DEFAULT_FREQUENCY.morning,
      instructions:
        "Apply generously as the final morning step. Reapply every 2–3 hours when outdoors, sweating or exposed to strong sunlight.",
      suitableFor: ["All skin types"],
      warnings: ["Do not rely on sunscreen alone; also use shade and protective clothing."],
    })
  );

  addUniqueStep(
    night,
    makeStep({
      id: "pm-cleanser",
      category: ESSENTIAL_STEPS.cleanser.category,
      subcategory: cleanserSubtype,
      purpose: ESSENTIAL_STEPS.cleanser.purpose,
      frequency: DEFAULT_FREQUENCY.night,
      instructions:
        "Cleanse gently. If wearing heavy makeup or water-resistant sunscreen, use a gentle first cleanse before the regular cleanser.",
      suitableFor: [skinType || "Most skin types"],
    })
  );

  addUniqueStep(
    night,
    makeStep({
      id: "pm-moisturizer",
      category: ESSENTIAL_STEPS.moisturizer.category,
      subcategory: moisturizerSubtype,
      purpose: ESSENTIAL_STEPS.moisturizer.purpose,
      frequency: DEFAULT_FREQUENCY.night,
      instructions:
        "Apply after treatment steps. Use a slightly richer layer when the skin feels dry or tight.",
      suitableFor: [skinType || "Most skin types"],
    })
  );

  return { morning, night };
}

function addHydrationStep(routine, profileText) {
  if (!includesAny(profileText, ["dry", "dehydrated", "low hydration", "tightness"])) {
    return;
  }

  addUniqueStep(
    routine.morning,
    makeStep({
      id: "am-hydration-serum",
      category: "Hydrating Serum",
      subcategory: "Hyaluronic acid, glycerin or panthenol serum",
      purpose: "Improve surface hydration and reduce the feeling of tightness.",
      frequency: DEFAULT_FREQUENCY.morning,
      instructions:
        "Apply to slightly damp skin, then seal with moisturizer.",
      suitableFor: ["Dry skin", "Dehydrated skin", "Combination skin"],
      activeGroup: "hydration",
    })
  );
}

function addOilAndPoreStep(routine, profileText) {
  if (!includesAny(profileText, ["oily", "oiliness", "large pores", "open pores", "visible pores"])) {
    return;
  }

  addUniqueStep(
    routine.night,
    makeStep({
      id: "pm-niacinamide",
      category: "Niacinamide Serum",
      subcategory: "Low-to-moderate strength niacinamide",
      purpose: "Support oil balance, the skin barrier and the appearance of pores.",
      frequency: "Start 3–4 nights per week; increase if well tolerated",
      instructions:
        "Apply a few drops after cleansing and before moisturizer.",
      suitableFor: ["Oily skin", "Combination skin", "Visible pores"],
      warnings: ["Avoid very high strengths if the skin is reactive."],
      activeGroup: "niacinamide",
    })
  );
}

function addAcneStep(routine, profileText, sensitivityHigh, beginner) {
  if (!includesAny(profileText, ["acne", "blackheads", "whiteheads", "clogged pores", "congestion"])) {
    return;
  }

  if (sensitivityHigh) {
    addUniqueStep(
      routine.night,
      makeStep({
        id: "pm-azelaic-acid",
        category: "Azelaic Acid Treatment",
        subcategory: "Gentle azelaic-acid treatment",
        purpose: "Help improve the appearance of blemishes, redness and post-acne marks with a generally sensitivity-friendly approach.",
        frequency: "Start 2 nights per week",
        instructions:
          "Apply a thin layer after cleansing, followed by moisturizer.",
        suitableFor: ["Acne-prone skin", "Sensitive skin", "Post-acne marks"],
        warnings: ["Patch-test first and reduce frequency if stinging persists."],
        activeGroup: "treatment",
      })
    );
    return;
  }

  addUniqueStep(
    routine.weekly,
    makeStep({
      id: "weekly-bha",
      category: "Salicylic Acid Exfoliant",
      subcategory: "Leave-on BHA treatment",
      purpose: "Help reduce clogged pores, blackheads and excess oil.",
      frequency: beginner ? "Once weekly" : "1–2 nights per week",
      instructions:
        "Use at night after cleansing. Follow with moisturizer and avoid other strong actives that evening.",
      suitableFor: ["Oily skin", "Acne-prone skin", "Congested skin"],
      warnings: [
        "Do not combine on the same night with retinoids or another exfoliating acid.",
        "Stop or reduce use if persistent irritation occurs.",
      ],
      activeGroup: "exfoliant",
    })
  );
}

function addPigmentationStep(routine, profileText, sensitivityHigh) {
  if (!includesAny(profileText, ["pigmentation", "dark spots", "post acne marks", "uneven tone", "dullness", "tan"])) {
    return;
  }

  if (!sensitivityHigh) {
    addUniqueStep(
      routine.morning,
      makeStep({
        id: "am-vitamin-c",
        category: "Vitamin C Serum",
        subcategory: "Beginner-friendly antioxidant serum",
        purpose: "Support brightness and help reduce the appearance of uneven tone when paired with sunscreen.",
        frequency: "Start every other morning",
        instructions:
          "Apply after cleansing and before moisturizer. Use sunscreen consistently.",
        suitableFor: ["Dullness", "Uneven tone", "Visible pigmentation"],
        warnings: ["Reduce frequency if irritation occurs."],
        activeGroup: "antioxidant",
      })
    );
  }

  addUniqueStep(
    routine.night,
    makeStep({
      id: "pm-pigmentation-serum",
      category: sensitivityHigh ? "Alpha Arbutin Serum" : "Tranexamic Acid Serum",
      subcategory: sensitivityHigh
        ? "Gentle tone-evening serum"
        : "Targeted pigmentation-support serum",
      purpose: "Help improve the appearance of visible dark spots and uneven tone.",
      frequency: "Start 3 nights per week",
      instructions:
        "Apply after cleansing and before moisturizer. Introduce gradually.",
      suitableFor: ["Pigmentation", "Post-acne marks", "Uneven tone"],
      warnings: ["Consistent sunscreen use is essential for visible pigmentation concerns."],
      activeGroup: "pigmentation",
    })
  );
}

function addFineLineStep(routine, profileText, pregnancyRestricted, sensitivityHigh, beginner) {
  if (!includesAny(profileText, ["fine lines", "skin ageing", "aging", "wrinkles", "loss of firmness"])) {
    return;
  }

  if (pregnancyRestricted || sensitivityHigh) {
    addUniqueStep(
      routine.night,
      makeStep({
        id: "pm-peptide-serum",
        category: "Peptide Serum",
        subcategory: "Barrier-friendly peptide treatment",
        purpose: "Support hydration and the appearance of smoother, firmer-looking skin without using a retinoid.",
        frequency: "3–5 nights per week",
        instructions: "Apply before moisturizer.",
        suitableFor: ["Fine lines", "Sensitive skin"],
        activeGroup: "peptide",
      })
    );
    return;
  }

  addUniqueStep(
    routine.weekly,
    makeStep({
      id: "weekly-retinoid",
      category: "Retinol Treatment",
      subcategory: "Beginner-strength cosmetic retinol",
      purpose: "Support smoother-looking texture and reduce the appearance of fine lines over time.",
      frequency: beginner ? "Once weekly at night" : "1–2 nights per week",
      instructions:
        "Apply a small amount to dry skin at night. Follow with moisturizer. Increase frequency gradually only if well tolerated.",
      suitableFor: ["Fine lines", "Uneven texture"],
      warnings: [
        "Do not use during pregnancy or breastfeeding unless a qualified clinician says it is appropriate.",
        "Do not combine on the same night with exfoliating acids.",
        "Daily sunscreen is essential.",
      ],
      activeGroup: "retinoid",
    })
  );
}

function applyBarrierRecoveryMode(routine, profileText) {
  if (!isBarrierCompromised(profileText)) return false;

  routine.morning = routine.morning.filter((step) =>
    ["Cleanser", "Moisturizer", "Sunscreen"].includes(step.category)
  );

  routine.night = routine.night.filter((step) =>
    ["Cleanser", "Moisturizer"].includes(step.category)
  );

  routine.weekly = [];

  routine.precautions.push(
    "The skin barrier appears possibly compromised. Pause exfoliants, retinoids and strong treatment serums until the skin feels calm and comfortable."
  );

  routine.notes.push(
    "Use a minimal barrier-recovery routine for approximately 2–4 weeks, then reintroduce one active at a time."
  );

  return true;
}

function applyRoutineSafety(routine, context) {
  const { sensitivityHigh, pregnancyRestricted, beginner } = context;

  if (pregnancyRestricted) {
    routine.weekly = routine.weekly.filter(
      (step) => normalizeText(step.activeGroup) !== "retinoid"
    );
    routine.precautions.push(
      "Retinoids were excluded because pregnancy or breastfeeding was reported. Confirm uncertain ingredients with a qualified clinician."
    );
  }

  if (sensitivityHigh) {
    routine.weekly = routine.weekly.filter(
      (step) => normalizeText(step.activeGroup) !== "retinoid"
    );
    routine.precautions.push(
      "Because sensitivity appears high, introduce only one treatment at a time and patch-test before facial use."
    );
  }

  if (beginner) {
    const activeNightSteps = routine.night.filter((step) => step.activeGroup);
    if (activeNightSteps.length > 1) {
      const keep = activeNightSteps[0].id;
      routine.night = routine.night.filter(
        (step) => !step.activeGroup || step.id === keep
      );
      routine.notes.push(
        "The night routine was simplified to one treatment serum because the user appears to be a skincare beginner."
      );
    }
  }

  const weeklyGroups = new Set();
  routine.weekly = routine.weekly.filter((step) => {
    if (!step.activeGroup) return true;
    if (weeklyGroups.has(step.activeGroup)) return false;
    weeklyGroups.add(step.activeGroup);
    return true;
  });
}

function orderRoutineSteps(routine) {
  const order = {
    cleanser: 10,
    toner: 20,
    "hydrating serum": 30,
    "vitamin c serum": 35,
    "niacinamide serum": 40,
    "alpha arbutin serum": 40,
    "tranexamic acid serum": 40,
    "azelaic acid treatment": 45,
    "peptide serum": 45,
    moisturizer: 80,
    sunscreen: 90,
  };

  const sortSteps = (steps) =>
    steps
      .sort(
        (a, b) =>
          (order[normalizeText(a.category)] || 50) -
          (order[normalizeText(b.category)] || 50)
      )
      .map((step, index) => ({ ...step, step: index + 1 }));

  routine.morning = sortSteps(routine.morning);
  routine.night = sortSteps(routine.night);
  routine.weekly = routine.weekly.map((step, index) => ({
    ...step,
    step: index + 1,
  }));
}

function buildRoutineSummary(routine, analysis = {}) {
  const skinType = analysis.skinType || "reported";
  const concerns = [
    ...normalizeStringArray(analysis.mainConcerns),
    ...normalizeStringArray(analysis.concerns),
  ];

  return {
    title: `${skinType} skin routine`,
    focus:
      concerns.length > 0
        ? concerns.slice(0, 3)
        : ["Maintain hydration", "Support the skin barrier", "Daily sun protection"],
    morningStepCount: routine.morning.length,
    nightStepCount: routine.night.length,
    weeklyStepCount: routine.weekly.length,
  };
}

function buildRoutine(analysis = {}, questionnaire = {}) {
  if (!analysis || typeof analysis !== "object") {
    throw new TypeError("A valid skin analysis object is required.");
  }

  const profileText = createProfileText(analysis, questionnaire);
  const skinType =
    typeof analysis.skinType === "string" && analysis.skinType.trim()
      ? analysis.skinType.trim()
      : "Unspecified";

  const sensitivityHigh = isHighSensitivity(profileText);
  const pregnancyRestricted = isPregnancyRestricted(profileText);
  const beginner = isBeginner(questionnaire);

  const essentials = buildEssentialRoutine({ skinType, profileText });

  const routine = {
    morning: essentials.morning,
    night: essentials.night,
    weekly: [],
    precautions: [
      "Patch-test each new product before regular use.",
      "Introduce only one new treatment product at a time.",
      "Stop using a product if persistent burning, swelling or worsening irritation occurs.",
      "This routine provides cosmetic skincare guidance and is not a medical diagnosis.",
    ],
    notes: [],
  };

  addHydrationStep(routine, profileText);
  addOilAndPoreStep(routine, profileText);
  addAcneStep(routine, profileText, sensitivityHigh, beginner);
  addPigmentationStep(routine, profileText, sensitivityHigh);
  addFineLineStep(
    routine,
    profileText,
    pregnancyRestricted,
    sensitivityHigh,
    beginner
  );

  const barrierRecoveryMode = applyBarrierRecoveryMode(routine, profileText);

  if (!barrierRecoveryMode) {
    applyRoutineSafety(routine, {
      sensitivityHigh,
      pregnancyRestricted,
      beginner,
    });
  }

  orderRoutineSteps(routine);

  routine.summary = buildRoutineSummary(routine, analysis);
  routine.metadata = {
    generatedAt: new Date().toISOString(),
    skinType,
    sensitivityHigh,
    pregnancyRestricted,
    beginner,
    barrierRecoveryMode,
  };

  return routine;
}

module.exports = {
  buildRoutine,
  normalizeText,
  createProfileText,
};
