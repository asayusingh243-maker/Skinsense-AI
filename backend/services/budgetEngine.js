"use strict";

const productCatalog = require("../data/productCatalog");

const ESSENTIAL_CATEGORIES = [
  "cleanser",
  "moisturizer",
  "moisturiser",
  "ceramide moisturizer",
  "barrier moisturizer",
  "sunscreen",
  "spf",
];

const CATEGORY_PRIORITY = {
  cleanser: 100,
  moisturizer: 95,
  moisturiser: 95,
  "ceramide moisturizer": 96,
  "barrier moisturizer": 96,
  sunscreen: 100,
  spf: 100,
  niacinamide: 70,
  "vitamin c": 65,
  "hyaluronic acid": 60,
  "azelaic acid": 60,
  "salicylic acid": 55,
  "tranexamic acid": 55,
  "alpha arbutin": 50,
  retinol: 45,
  exfoliant: 35,
  "clay mask": 20,
  mask: 20,
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? Math.round(price) : 0;
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
      ? routine.morning.map((step) => ({
          ...step,
          product: step?.product ? { ...step.product } : null,
        }))
      : [],
    night: Array.isArray(routine.night)
      ? routine.night.map((step) => ({
          ...step,
          product: step?.product ? { ...step.product } : null,
        }))
      : [],
    weekly: Array.isArray(routine.weekly)
      ? routine.weekly.map((step) => ({
          ...step,
          product: step?.product ? { ...step.product } : null,
        }))
      : [],
  };
}

function extractBudget(questionnaire = {}) {
  const fields = [
    questionnaire.totalBudget,
    questionnaire.budget,
    questionnaire.skincareBudget,
    questionnaire.monthlyBudget,
    questionnaire.productBudget,
    questionnaire.routineBudget,
    questionnaire.budgetRange,
  ];

  for (const value of fields) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }

    if (typeof value === "string") {
      const amounts = value
        .replace(/,/g, "")
        .match(/\d+(?:\.\d+)?/g);

      if (amounts?.length) {
        const valid = amounts
          .map(Number)
          .filter((amount) => Number.isFinite(amount) && amount > 0);

        if (valid.length) {
          return Math.round(Math.max(...valid));
        }
      }
    }
  }

  return 0;
}

function getCategory(stepOrProduct) {
  return normalizeText(
    stepOrProduct?.category ||
      stepOrProduct?.product?.category ||
      stepOrProduct?.type ||
      stepOrProduct?.productType
  );
}

function isEssentialCategory(category) {
  const normalized = normalizeText(category);

  return ESSENTIAL_CATEGORIES.some(
    (essential) =>
      normalized === normalizeText(essential) ||
      normalized.includes(normalizeText(essential))
  );
}

function getPriority(step) {
  const category = getCategory(step);

  if (isEssentialCategory(category)) {
    return CATEGORY_PRIORITY[category] || 95;
  }

  for (const [key, value] of Object.entries(CATEGORY_PRIORITY)) {
    if (category.includes(key) || key.includes(category)) {
      return value;
    }
  }

  return 40;
}

function getProductId(product, index = 0) {
  if (typeof product?.id === "string" && product.id.trim()) {
    return product.id.trim();
  }

  return `${product?.brand || "product"}-${product?.name || index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateRoutineTotal(routine) {
  const seen = new Set();
  let total = 0;

  for (const sectionName of ["morning", "night", "weekly"]) {
    for (const step of routine?.[sectionName] || []) {
      const product = step?.product;
      if (!product) continue;

      const id = getProductId(product);

      if (seen.has(id)) continue;

      seen.add(id);
      total += safePrice(product.price);
    }
  }

  return total;
}

function getUsedProductIds(routine) {
  const used = new Set();

  for (const sectionName of ["morning", "night", "weekly"]) {
    for (const step of routine?.[sectionName] || []) {
      if (!step?.product) continue;
      used.add(getProductId(step.product));
    }
  }

  return used;
}

function buildProfileText(skinAnalysis = {}, questionnaire = {}) {
  return normalizeText(
    [
      skinAnalysis.skinType,
      skinAnalysis.sensitivity,
      skinAnalysis.hydration,
      skinAnalysis.oiliness,
      skinAnalysis.barrier,
      skinAnalysis.barrierCondition,
      ...(Array.isArray(skinAnalysis.mainConcerns)
        ? skinAnalysis.mainConcerns
        : []),
      ...(Array.isArray(skinAnalysis.concerns)
        ? skinAnalysis.concerns
        : []),
      questionnaire.skinFeeling,
      questionnaire.sensitiveSkin,
      questionnaire.acne,
      questionnaire.pigmentation,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function categoryMatches(product, requestedCategory) {
  const productCategory = normalizeText(
    product?.category ||
      product?.type ||
      product?.productType
  );
  const requested = normalizeText(requestedCategory);

  if (!productCategory || !requested) return false;
  if (productCategory === requested) return true;

  if (
    requested.includes("moistur") &&
    productCategory.includes("moistur")
  ) {
    return true;
  }

  if (
    (requested.includes("sunscreen") || requested.includes("spf")) &&
    (productCategory.includes("sunscreen") || productCategory.includes("spf"))
  ) {
    return true;
  }

  if (
    requested.includes("cleanser") &&
    (productCategory.includes("cleanser") ||
      productCategory.includes("face wash"))
  ) {
    return true;
  }

  return false;
}

function scoreAlternative(product, step, skinAnalysis, questionnaire) {
  const profileText = buildProfileText(skinAnalysis, questionnaire);
  const productSkinTypes = normalizeStringArray(product?.skinTypes)
    .map(normalizeText);
  const productConcerns = normalizeStringArray(product?.concerns);

  let score = 0;

  const skinType = normalizeText(skinAnalysis?.skinType);

  if (
    skinType &&
    productSkinTypes.some(
      (item) =>
        item === skinType ||
        item.includes(skinType) ||
        skinType.includes(item)
    )
  ) {
    score += 10;
  }

  for (const concern of productConcerns) {
    const normalizedConcern = normalizeText(concern);

    if (normalizedConcern && profileText.includes(normalizedConcern)) {
      score += 4;
    }
  }

  if (product?.verified === true || product?.isVerified === true) {
    score += 2;
  }

  if (isEssentialCategory(getCategory(step))) {
    score += 3;
  }

  return score;
}

function normalizeReplacementProduct(product, index) {
  return {
    id: getProductId(product, index),
    brand: typeof product?.brand === "string" ? product.brand.trim() : "",
    name: typeof product?.name === "string" ? product.name.trim() : "",
    category:
      typeof product?.category === "string"
        ? product.category.trim()
        : "",
    size: typeof product?.size === "string" ? product.size.trim() : "",
    price: safePrice(product?.price),
    originalPrice: safePrice(product?.originalPrice),
    currency:
      typeof product?.currency === "string" && product.currency.trim()
        ? product.currency.trim()
        : "INR",
    seller:
      typeof product?.seller === "string" ? product.seller.trim() : "",
    buyUrl:
      typeof product?.buyUrl === "string"
        ? product.buyUrl.trim()
        : typeof product?.buyLink === "string"
          ? product.buyLink.trim()
          : "",
    alternativeSeller:
      typeof product?.alternativeSeller === "string"
        ? product.alternativeSeller.trim()
        : "",
    alternativeBuyUrl:
      typeof product?.alternativeBuyUrl === "string"
        ? product.alternativeBuyUrl.trim()
        : "",
    imageUrl:
      typeof product?.imageUrl === "string"
        ? product.imageUrl.trim()
        : typeof product?.image === "string"
          ? product.image.trim()
          : "",
    keyIngredients: normalizeStringArray(product?.keyIngredients),
    usage:
      typeof product?.usage === "string" ? product.usage.trim() : "",
    warnings: normalizeStringArray(product?.warnings),
    priceCheckedAt:
      typeof product?.priceCheckedAt === "string"
        ? product.priceCheckedAt.trim()
        : "",
  };
}

function findCheaperAlternative({
  step,
  currentProduct,
  usedProductIds,
  skinAnalysis,
  questionnaire,
}) {
  const currentPrice = safePrice(currentProduct?.price);
  const requestedCategory = getCategory(step);

  const candidates = productCatalog
    .map((product, index) => {
      const id = getProductId(product, index);
      const price = safePrice(product?.price);

      if (!categoryMatches(product, requestedCategory)) return null;
      if (usedProductIds.has(id)) return null;
      if (price <= 0) return null;
      if (currentPrice > 0 && price >= currentPrice) return null;

      return {
        product,
        index,
        id,
        price,
        score: scoreAlternative(
          product,
          step,
          skinAnalysis,
          questionnaire
        ),
      };
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (first.price !== second.price) {
        return first.price - second.price;
      }

      return second.score - first.score;
    });

  return candidates[0] || null;
}

function replaceExpensiveProducts({
  routine,
  budget,
  skinAnalysis,
  questionnaire,
  replacements,
}) {
  let currentTotal = calculateRoutineTotal(routine);
  const usedProductIds = getUsedProductIds(routine);

  const allSteps = [];

  for (const sectionName of ["weekly", "night", "morning"]) {
    for (let index = 0; index < routine[sectionName].length; index += 1) {
      const step = routine[sectionName][index];

      if (!step?.product) continue;

      allSteps.push({
        sectionName,
        index,
        step,
        priority: getPriority(step),
        price: safePrice(step.product.price),
      });
    }
  }

  allSteps.sort((first, second) => {
    if (first.priority !== second.priority) {
      return first.priority - second.priority;
    }

    return second.price - first.price;
  });

  for (const item of allSteps) {
    if (currentTotal <= budget) break;

    const currentProduct =
      routine[item.sectionName][item.index]?.product;

    if (!currentProduct) continue;

    const alternative = findCheaperAlternative({
      step: item.step,
      currentProduct,
      usedProductIds,
      skinAnalysis,
      questionnaire,
    });

    if (!alternative) continue;

    const oldPrice = safePrice(currentProduct.price);
    const newProduct = normalizeReplacementProduct(
      alternative.product,
      alternative.index
    );
    const newPrice = safePrice(newProduct.price);

    usedProductIds.delete(getProductId(currentProduct));
    usedProductIds.add(newProduct.id);

    routine[item.sectionName][item.index] = {
      ...routine[item.sectionName][item.index],
      product: {
        ...newProduct,
        reason: `Selected as a lower-cost alternative for the ${item.step.category} step.`,
      },
    };

    currentTotal -= Math.max(0, oldPrice - newPrice);

    replacements.push({
      section: item.sectionName,
      category: item.step.category || "",
      removedProduct: currentProduct.name || "",
      replacementProduct: newProduct.name || "",
      oldPrice,
      newPrice,
      savings: Math.max(0, oldPrice - newPrice),
      reason:
        "Replaced with a cheaper product from the same routine category.",
    });
  }

  return currentTotal;
}

function removeOptionalSteps({
  routine,
  budget,
  removedSteps,
}) {
  let currentTotal = calculateRoutineTotal(routine);

  const removable = [];

  for (const sectionName of ["weekly", "night", "morning"]) {
    for (let index = 0; index < routine[sectionName].length; index += 1) {
      const step = routine[sectionName][index];
      const category = getCategory(step);

      if (!step?.product || isEssentialCategory(category)) continue;

      removable.push({
        sectionName,
        index,
        priority: getPriority(step),
        price: safePrice(step.product.price),
        step,
      });
    }
  }

  removable.sort((first, second) => {
    if (first.priority !== second.priority) {
      return first.priority - second.priority;
    }

    return second.price - first.price;
  });

  for (const item of removable) {
    if (currentTotal <= budget) break;

    const currentIndex = routine[item.sectionName].findIndex(
      (candidate) =>
        candidate === item.step ||
        (candidate?.product?.id &&
          candidate.product.id === item.step.product?.id)
    );

    if (currentIndex === -1) continue;

    const [removed] = routine[item.sectionName].splice(currentIndex, 1);
    const removedPrice = safePrice(removed?.product?.price);

    currentTotal = calculateRoutineTotal(routine);

    removedSteps.push({
      section: item.sectionName,
      category: removed?.category || "",
      product: removed?.product?.name || "",
      price: removedPrice,
      reason:
        "Removed as a lower-priority optional step to help fit the routine within budget.",
    });
  }

  return currentTotal;
}

function reindexRoutine(routine) {
  for (const sectionName of ["morning", "night", "weekly"]) {
    routine[sectionName] = routine[sectionName].map(
      (step, index) => ({
        ...step,
        step: index + 1,
        section: sectionName,
      })
    );
  }

  return routine;
}

function optimizeRoutineForBudget(
  inputRoutine,
  skinAnalysis = {},
  questionnaire = {}
) {
  if (!Array.isArray(productCatalog)) {
    throw new Error("productCatalog.js must export an array.");
  }

  const routine = cloneRoutine(inputRoutine);
  const budget = extractBudget(questionnaire);
  const originalTotal = calculateRoutineTotal(routine);
  const replacements = [];
  const removedSteps = [];
  const warnings = [];

  if (budget <= 0) {
    return {
      routine: reindexRoutine(routine),
      budget: {
        status: "Budget not provided",
        detectedBudget: 0,
        originalTotal,
        finalTotal: originalTotal,
        savings: 0,
        remainingBudget: 0,
        currency: "INR",
        replacements,
        removedSteps,
        warnings: [
          "No valid budget was provided, so the routine was not reduced.",
        ],
      },
    };
  }

  let finalTotal = originalTotal;

  if (finalTotal > budget) {
    finalTotal = replaceExpensiveProducts({
      routine,
      budget,
      skinAnalysis,
      questionnaire,
      replacements,
    });
  }

  if (finalTotal > budget) {
    finalTotal = removeOptionalSteps({
      routine,
      budget,
      removedSteps,
    });
  }

  finalTotal = calculateRoutineTotal(routine);

  if (finalTotal > budget) {
    warnings.push(
      "The essential cleanser, moisturizer, and sunscreen steps could not all fit within the detected budget using the current catalog."
    );
  }

  if (finalTotal === 0) {
    warnings.push(
      "No priced products remained after budget optimization. Check product prices in productCatalog.js."
    );
  }

  const status =
    finalTotal <= budget ? "Within budget" : "Above budget";

  return {
    routine: reindexRoutine(routine),
    budget: {
      status,
      detectedBudget: budget,
      originalTotal,
      finalTotal,
      savings: Math.max(0, originalTotal - finalTotal),
      remainingBudget: Math.max(0, budget - finalTotal),
      overBudgetBy: Math.max(0, finalTotal - budget),
      currency: "INR",
      replacements,
      removedSteps,
      warnings,
    },
  };
}

module.exports = {
  optimizeRoutineForBudget,
  calculateRoutineTotal,
  extractBudget,
  isEssentialCategory,
};
