"use strict";

/**
 * SkinSense AI Safety Engine
 *
 * This module validates and adjusts an already-built routine.
 * It does not diagnose medical conditions and should not replace
 * professional medical advice.
 */

const ACTIVE_GROUPS = {
  retinoids: ["retinol", "retinal", "retinoid", "tretinoin", "adapalene"],
  exfoliatingAcids: [
    "salicylic acid",
    "glycolic acid",
    "lactic acid",
    "mandelic acid",
    "aha",
    "bha",
    "pha",
    "exfoliant",
  ],
  vitaminC: [
    "vitamin c",
    "ascorbic acid",
    "ethyl ascorbic acid",
    "ascorbyl glucoside",
  ],
  benzoylPeroxide: ["benzoyl peroxide"],
  azelaicAcid: ["azelaic acid"],
  tranexamicAcid: ["tranexamic acid", "txa"],
  alphaArbutin: ["alpha arbutin", "arbutin"],
  niacinamide: ["niacinamide", "vitamin b3"],
};

const STRONG_ACTIVE_GROUPS = [
  "retinoids",
  "exfoliatingAcids",
  "benzoylPeroxide",
];

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

function cloneRoutine(routine = {}) {
  return {
    morning: Array.isArray(routine.morning)
      ? routine.morning.map((step) => ({ ...step }))
      : [],
    night: Array.isArray(routine.night)
      ? routine.night.map((step) => ({ ...step }))
      : [],
    weekly: Array.isArray(routine.weekly)
      ? routine.weekly.map((step) => ({ ...step }))
      : [],
  };
}

function getStepText(step) {
  const product = step?.product || {};

  return normalizeText(
    [
      step?.category,
      step?.name,
      step?.purpose,
      step?.instruction,
      step?.frequency,
      product?.name,
      product?.category,
      product?.usage,
      ...(normalizeStringArray(product?.keyIngredients)),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function getActiveGroups(step) {
  const text = getStepText(step);
  const groups = [];

  for (const [group, terms] of Object.entries(ACTIVE_GROUPS)) {
    if (containsAny(text, terms)) {
      groups.push(group);
    }
  }

  return groups;
}

function hasActiveGroup(step, group) {
  return getActiveGroups(step).includes(group);
}

function isPregnantOrBreastfeeding(questionnaire = {}) {
  const text = normalizeText(
    [
      questionnaire.pregnant,
      questionnaire.pregnancy,
      questionnaire.breastfeeding,
      questionnaire.nursing,
      questionnaire.specialCondition,
      questionnaire.medicalNotes,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    text.includes("pregnant") ||
    text.includes("pregnancy") ||
    text.includes("breastfeeding") ||
    text.includes("breast feeding") ||
    text.includes("nursing")
  );
}

function isSensitiveSkin(skinAnalysis = {}, questionnaire = {}) {
  const text = normalizeText(
    [
      skinAnalysis.sensitivity,
      skinAnalysis.skinType,
      ...(Array.isArray(skinAnalysis.mainConcerns)
        ? skinAnalysis.mainConcerns
        : []),
      questionnaire.sensitiveSkin,
      questionnaire.skinFeeling,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    text.includes("high") ||
    text.includes("very sensitive") ||
    text.includes("sensitive")
  );
}

function hasDamagedBarrier(skinAnalysis = {}) {
  const text = normalizeText(
    [
      skinAnalysis.barrier,
      skinAnalysis.barrierCondition,
      skinAnalysis.hydration,
      ...(Array.isArray(skinAnalysis.mainConcerns)
        ? skinAnalysis.mainConcerns
        : []),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    text.includes("damaged barrier") ||
    text.includes("compromised barrier") ||
    text.includes("weakened barrier") ||
    text.includes("irritated barrier")
  );
}

function isBeginner(questionnaire = {}) {
  const text = normalizeText(
    [
      questionnaire.routine,
      questionnaire.experience,
      questionnaire.skincareExperience,
      questionnaire.currentRoutine,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    text.includes("beginner") ||
    text.includes("new to skincare") ||
    text.includes("no routine") ||
    text.includes("basic")
  );
}

function reindexRoutineSection(steps) {
  return steps.map((step, index) => ({
    ...step,
    step: index + 1,
  }));
}

function removeStepsByPredicate(steps, predicate, changes, reason) {
  const kept = [];

  for (const step of steps) {
    if (predicate(step)) {
      changes.push({
        action: "Removed",
        section: step.section || "",
        category: step.category || "",
        product: step.product?.name || "",
        reason,
      });
      continue;
    }

    kept.push(step);
  }

  return kept;
}

function addUniqueWarning(warnings, message) {
  if (!warnings.includes(message)) {
    warnings.push(message);
  }
}

function addUniquePrecaution(precautions, message) {
  if (!precautions.includes(message)) {
    precautions.push(message);
  }
}

function separateVitaminCAndRetinoid(routine, changes) {
  const morningRetinoids = routine.morning.filter((step) =>
    hasActiveGroup(step, "retinoids")
  );

  if (morningRetinoids.length === 0) return;

  for (const step of morningRetinoids) {
    routine.morning = routine.morning.filter((item) => item !== step);

    const alreadyPresentAtNight = routine.night.some(
      (nightStep) =>
        nightStep.product?.id &&
        nightStep.product.id === step.product?.id
    );

    if (!alreadyPresentAtNight) {
      routine.night.splice(
        Math.max(1, routine.night.length - 1),
        0,
        {
          ...step,
          section: "night",
        }
      );
    }

    changes.push({
      action: "Moved",
      section: "morning → night",
      category: step.category || "Retinoid",
      product: step.product?.name || "",
      reason:
        "Retinoids are generally better placed in the night routine and should be separated from morning vitamin C use.",
    });
  }
}

function removeSameRoutineConflicts(routine, changes, warnings) {
  for (const sectionName of ["morning", "night"]) {
    const steps = routine[sectionName];

    const retinoidIndexes = [];
    const acidIndexes = [];
    const benzoylIndexes = [];

    steps.forEach((step, index) => {
      const groups = getActiveGroups(step);

      if (groups.includes("retinoids")) retinoidIndexes.push(index);
      if (groups.includes("exfoliatingAcids")) acidIndexes.push(index);
      if (groups.includes("benzoylPeroxide")) benzoylIndexes.push(index);
    });

    if (retinoidIndexes.length && acidIndexes.length) {
      const removeIndex = acidIndexes[acidIndexes.length - 1];
      const removed = routine[sectionName].splice(removeIndex, 1)[0];

      changes.push({
        action: "Removed",
        section: sectionName,
        category: removed?.category || "",
        product: removed?.product?.name || "",
        reason:
          "Retinoids and exfoliating acids were found in the same routine. The exfoliating step was removed to reduce irritation risk.",
      });

      addUniqueWarning(
        warnings,
        "Do not combine retinoids and exfoliating acids in the same routine unless a qualified dermatologist has advised it."
      );
    }

    if (retinoidIndexes.length && benzoylIndexes.length) {
      const removeIndex = benzoylIndexes[benzoylIndexes.length - 1];
      const removed = routine[sectionName].splice(removeIndex, 1)[0];

      changes.push({
        action: "Removed",
        section: sectionName,
        category: removed?.category || "",
        product: removed?.product?.name || "",
        reason:
          "Retinoid and benzoyl peroxide steps were separated to reduce dryness and irritation risk.",
      });

      addUniqueWarning(
        warnings,
        "Avoid using retinoids and benzoyl peroxide together in the same routine unless specifically instructed by a clinician."
      );
    }
  }
}

function limitStrongActives(routine, maxStrongActives, changes) {
  let count = 0;

  for (const sectionName of ["morning", "night", "weekly"]) {
    const kept = [];

    for (const step of routine[sectionName]) {
      const groups = getActiveGroups(step);
      const isStrong = groups.some((group) =>
        STRONG_ACTIVE_GROUPS.includes(group)
      );

      if (!isStrong) {
        kept.push(step);
        continue;
      }

      count += 1;

      if (count <= maxStrongActives) {
        kept.push(step);
        continue;
      }

      changes.push({
        action: "Removed",
        section: sectionName,
        category: step.category || "",
        product: step.product?.name || "",
        reason:
          "The number of strong active ingredients was reduced to make the routine safer and easier to tolerate.",
      });
    }

    routine[sectionName] = kept;
  }
}

function simplifyForDamagedBarrier(routine, changes, warnings) {
  const allowedCategories = [
    "cleanser",
    "moisturizer",
    "moisturiser",
    "ceramide moisturizer",
    "barrier moisturizer",
    "sunscreen",
    "spf",
  ];

  for (const sectionName of ["morning", "night", "weekly"]) {
    routine[sectionName] = removeStepsByPredicate(
      routine[sectionName],
      (step) => {
        const category = normalizeText(step?.category);
        return !allowedCategories.some((allowed) =>
          category.includes(normalizeText(allowed))
        );
      },
      changes,
      "The routine was simplified because the skin barrier appears compromised."
    );
  }

  addUniqueWarning(
    warnings,
    "Use a simple cleanser, barrier-supporting moisturizer, and sunscreen until irritation and barrier discomfort improve."
  );
}

function removeDuplicateProducts(routine, changes) {
  const seen = new Set();

  for (const sectionName of ["morning", "night", "weekly"]) {
    routine[sectionName] = routine[sectionName].filter((step) => {
      const key =
        step?.product?.id ||
        normalizeText(
          `${step?.product?.brand || ""} ${step?.product?.name || ""}`
        );

      if (!key) return true;

      if (seen.has(key)) {
        changes.push({
          action: "Removed duplicate",
          section: sectionName,
          category: step.category || "",
          product: step.product?.name || "",
          reason:
            "The same product was already included elsewhere in the routine.",
        });
        return false;
      }

      seen.add(key);
      return true;
    });
  }
}

function limitWeeklyExfoliation(routine, changes, warnings) {
  let exfoliantFound = false;

  routine.weekly = routine.weekly.filter((step) => {
    if (!hasActiveGroup(step, "exfoliatingAcids")) {
      return true;
    }

    if (!exfoliantFound) {
      exfoliantFound = true;

      step.frequency =
        step.frequency ||
        "Use once weekly initially, then increase only if well tolerated.";

      return true;
    }

    changes.push({
      action: "Removed",
      section: "weekly",
      category: step.category || "",
      product: step.product?.name || "",
      reason:
        "Only one weekly exfoliating treatment was kept to reduce over-exfoliation risk.",
    });

    return false;
  });

  if (exfoliantFound) {
    addUniqueWarning(
      warnings,
      "Start exfoliation once weekly and do not use it on the same night as retinol."
    );
  }
}

function validateRoutineSafety(
  inputRoutine,
  skinAnalysis = {},
  questionnaire = {}
) {
  const routine = cloneRoutine(inputRoutine);
  const changes = [];
  const warnings = [];
  const precautions = [];

  const pregnantOrBreastfeeding =
    isPregnantOrBreastfeeding(questionnaire);
  const sensitiveSkin = isSensitiveSkin(
    skinAnalysis,
    questionnaire
  );
  const damagedBarrier = hasDamagedBarrier(skinAnalysis);
  const beginner = isBeginner(questionnaire);

  if (pregnantOrBreastfeeding) {
    for (const sectionName of ["morning", "night", "weekly"]) {
      routine[sectionName] = removeStepsByPredicate(
        routine[sectionName],
        (step) => hasActiveGroup(step, "retinoids"),
        changes,
        "Retinoids were removed because the questionnaire indicates pregnancy or breastfeeding."
      );
    }

    addUniqueWarning(
      warnings,
      "Avoid retinoids during pregnancy or breastfeeding unless a qualified medical professional has specifically approved their use."
    );
  }

  separateVitaminCAndRetinoid(routine, changes);
  removeSameRoutineConflicts(routine, changes, warnings);
  limitWeeklyExfoliation(routine, changes, warnings);

  if (damagedBarrier) {
    simplifyForDamagedBarrier(routine, changes, warnings);
  } else if (sensitiveSkin) {
    limitStrongActives(routine, 1, changes);

    addUniqueWarning(
      warnings,
      "Introduce one active ingredient at a time and reduce frequency if stinging, redness, or persistent dryness occurs."
    );
  } else if (beginner) {
    limitStrongActives(routine, 2, changes);

    addUniqueWarning(
      warnings,
      "Beginners should introduce active ingredients gradually rather than starting several treatments at once."
    );
  }

  removeDuplicateProducts(routine, changes);

  routine.morning = reindexRoutineSection(routine.morning);
  routine.night = reindexRoutineSection(routine.night);
  routine.weekly = reindexRoutineSection(routine.weekly);

  addUniquePrecaution(
    precautions,
    "Patch-test every new product before applying it to the full face."
  );
  addUniquePrecaution(
    precautions,
    "Use broad-spectrum sunscreen every morning and reapply when outdoors."
  );
  addUniquePrecaution(
    precautions,
    "Stop using a product if persistent burning, swelling, rash, or severe irritation occurs."
  );
  addUniquePrecaution(
    precautions,
    "Seek professional medical advice for painful, severe, rapidly worsening, or persistent skin concerns."
  );

  const status = changes.length > 0 ? "Adjusted" : "Safe";

  return {
    routine,
    safety: {
      status,
      changes,
      warnings,
      precautions,
      checks: {
        pregnancyOrBreastfeeding: pregnantOrBreastfeeding,
        sensitiveSkin,
        damagedBarrier,
        beginner,
      },
      disclaimer:
        "This is cosmetic skincare guidance based on user-provided information. It is not a medical diagnosis or treatment plan.",
    },
  };
}

module.exports = {
  validateRoutineSafety,
  getActiveGroups,
  isPregnantOrBreastfeeding,
  isSensitiveSkin,
  hasDamagedBarrier,
};
