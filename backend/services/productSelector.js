"use strict";

const productCatalog = require("../data/productCatalog");

const FALLBACK_PRODUCT_IMAGE = "/products/product-placeholder.png";

const CATEGORY_ALIASES = {
  cleanser: ["cleanser", "face wash", "facewash", "cleansing gel", "cleansing foam"],
  moisturizer: ["moisturizer", "moisturiser", "cream", "gel moisturizer", "barrier cream"],
  sunscreen: ["sunscreen", "sun screen", "spf", "sun protection"],
  "vitamin c": ["vitamin c", "ascorbic acid", "brightening serum"],
  niacinamide: ["niacinamide", "vitamin b3"],
  "salicylic acid": ["salicylic acid", "bha"],
  "hyaluronic acid": ["hyaluronic acid", "sodium hyaluronate", "hydrating serum"],
  retinol: ["retinol", "retinoid", "retinal"],
  "alpha arbutin": ["alpha arbutin", "arbutin"],
  "tranexamic acid": ["tranexamic acid", "txa"],
  "azelaic acid": ["azelaic acid"],
  exfoliant: ["exfoliant", "exfoliating serum", "aha", "bha", "pha"],
  "clay mask": ["clay mask", "kaolin mask", "charcoal mask"],
  "ceramide moisturizer": [
    "ceramide moisturizer",
    "ceramide moisturiser",
    "barrier moisturizer",
    "barrier moisturiser",
    "barrier repair cream",
  ],
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

function normalizeCategory(value) {
  const normalized = normalizeText(value);

  if (!normalized) return "";

  for (const [canonical, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (
      canonical === normalized ||
      aliases.some((alias) => {
        const normalizedAlias = normalizeText(alias);
        return (
          normalized === normalizedAlias ||
          normalized.includes(normalizedAlias) ||
          normalizedAlias.includes(normalized)
        );
      })
    ) {
      return canonical;
    }
  }

  return normalized;
}

function getProductCategory(product) {
  return normalizeCategory(
    product?.category ||
      product?.type ||
      product?.productType ||
      product?.routineCategory
  );
}

function safePrice(value) {
  const price = Number(value);

  return Number.isFinite(price) && price > 0
    ? Math.round(price)
    : 0;
}

function createProductId(product, index) {
  if (typeof product?.id === "string" && product.id.trim()) {
    return product.id.trim();
  }

  return `${product?.brand || "product"}-${product?.name || index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractBudget(questionnaire = {}) {
  const possibleFields = [
    questionnaire.totalBudget,
    questionnaire.budget,
    questionnaire.skincareBudget,
    questionnaire.monthlyBudget,
    questionnaire.productBudget,
    questionnaire.budgetRange,
    questionnaire.routineBudget,
  ];

  for (const value of possibleFields) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }

    if (typeof value === "string") {
      const matches = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/g);

      if (matches?.length) {
        const amounts = matches
          .map(Number)
          .filter((amount) => Number.isFinite(amount) && amount > 0);

        if (amounts.length) {
          return Math.round(Math.max(...amounts));
        }
      }
    }
  }

  return 0;
}

function buildProfileText(skinAnalysis = {}, questionnaire = {}) {
  const values = [
    skinAnalysis.skinType,
    skinAnalysis.skinTone,
    skinAnalysis.acne,
    skinAnalysis.pigmentation,
    skinAnalysis.pores,
    skinAnalysis.hydration,
    skinAnalysis.oiliness,
    skinAnalysis.sensitivity,
    skinAnalysis.barrier,
    skinAnalysis.barrierCondition,
    ...(Array.isArray(skinAnalysis.mainConcerns)
      ? skinAnalysis.mainConcerns
      : []),
    ...(Array.isArray(skinAnalysis.concerns)
      ? skinAnalysis.concerns
      : []),
    questionnaire.skinFeeling,
    questionnaire.acne,
    questionnaire.pigmentation,
    questionnaire.pores,
    questionnaire.sensitiveSkin,
    questionnaire.oiliness,
    questionnaire.sunExposure,
    questionnaire.climate,
    questionnaire.outdoorTime,
  ];

  return normalizeText(values.filter(Boolean).join(" "));
}

function getEnvironmentNumber(questionnaire, field) {
  const value = Number(questionnaire?.environment?.[field]);
  return Number.isFinite(value) ? value : 0;
}

function productMatchesCategory(product, requestedCategory) {
  const productCategory = getProductCategory(product);
  const normalizedRequested = normalizeCategory(requestedCategory);

  if (!productCategory || !normalizedRequested) return false;

  if (productCategory === normalizedRequested) return true;

  if (
    normalizedRequested === "ceramide moisturizer" &&
    productCategory === "moisturizer"
  ) {
    const text = normalizeText(
      [
        product.name,
        product.category,
        ...(normalizeStringArray(product.keyIngredients)),
      ].join(" ")
    );

    return text.includes("ceramide") || text.includes("barrier");
  }

  if (
    normalizedRequested === "exfoliant" &&
    ["salicylic acid", "alpha arbutin", "tranexamic acid"].includes(productCategory)
  ) {
    return false;
  }

  return false;
}

function scoreProduct(product, routineStep, skinAnalysis, questionnaire) {
  const profileText = buildProfileText(skinAnalysis, questionnaire);
  const skinType = normalizeText(skinAnalysis?.skinType);
  const productSkinTypes = normalizeStringArray(product?.skinTypes).map(normalizeText);
  const productConcerns = normalizeStringArray(product?.concerns);
  const category = getProductCategory(product);
  const requestedCategory = normalizeCategory(routineStep?.category);

  let score = 0;
  const matchedConcerns = [];

  if (category === requestedCategory) score += 40;

  if (
    skinType &&
    productSkinTypes.some(
      (item) =>
        item === skinType ||
        item.includes(skinType) ||
        skinType.includes(item)
    )
  ) {
    score += 12;
  }

  if (
    profileText.includes("sensitive") &&
    productSkinTypes.includes("sensitive")
  ) {
    score += 8;
  }

  for (const concern of productConcerns) {
    const normalizedConcern = normalizeText(concern);

    if (normalizedConcern && profileText.includes(normalizedConcern)) {
      matchedConcerns.push(concern);
      score += 5;
    }
  }

  const keyIngredients = normalizeText(
    normalizeStringArray(product?.keyIngredients).join(" ")
  );

  if (
    requestedCategory === "ceramide moisturizer" &&
    (keyIngredients.includes("ceramide") ||
      normalizeText(product?.name).includes("ceramide"))
  ) {
    score += 15;
  }

  const humidity = getEnvironmentNumber(questionnaire, "humidityPercent");
  const uvIndex = getEnvironmentNumber(questionnaire, "uvIndex");
  const aqi = getEnvironmentNumber(questionnaire, "aqi");

  if (category === "sunscreen" && uvIndex >= 3) score += 8;
  if (
    category === "moisturizer" &&
    humidity > 0 &&
    humidity <= 45
  ) {
    score += 5;
  }
  if (
    category === "cleanser" &&
    (aqi >= 100 || profileText.includes("acne") || profileText.includes("oily"))
  ) {
    score += 4;
  }

  const beginner =
    normalizeText(questionnaire?.routine).includes("beginner") ||
    normalizeText(questionnaire?.experience).includes("beginner");

  if (beginner && normalizeText(product?.strength).includes("beginner")) {
    score += 3;
  }

  if (product?.verified === true || product?.isVerified === true) {
    score += 3;
  }

  const price = safePrice(product?.price);

  if (price > 0 && price <= 700) score += 2;

  return {
    score,
    matchedConcerns,
  };
}

function normalizeProduct(product, index, reason, matchedConcerns) {
  return {
    id: createProductId(product, index),
    brand: typeof product?.brand === "string" ? product.brand.trim() : "",
    name: typeof product?.name === "string" ? product.name.trim() : "",
    category:
      typeof product?.category === "string"
        ? product.category.trim()
        : "",
    size: typeof product?.size === "string" ? product.size.trim() : "",
    price: safePrice(product?.price),
    originalPrice: safePrice(product?.originalPrice),
    currency: "INR",
    seller:
      typeof product?.seller === "string" && product.seller.trim()
        ? product.seller.trim()
        : `${product?.brand || "Brand"} Official Website`,
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
      typeof product?.imageUrl === "string" && product.imageUrl.trim()
        ? product.imageUrl.trim()
        : typeof product?.image === "string" && product.image.trim()
          ? product.image.trim()
          : FALLBACK_PRODUCT_IMAGE,
    reason,
    matchedConcerns,
    keyIngredients: normalizeStringArray(product?.keyIngredients),
    usage:
      typeof product?.usage === "string" && product.usage.trim()
        ? product.usage.trim()
        : "Use according to the routine step and patch-test before regular use.",
    warnings:
      normalizeStringArray(product?.warnings).length > 0
        ? normalizeStringArray(product.warnings)
        : [
            "Patch-test before regular use.",
            "Stop use if persistent irritation occurs.",
          ],
    priceCheckedAt:
      typeof product?.priceCheckedAt === "string"
        ? product.priceCheckedAt.trim()
        : "",
  };
}

function buildReason(product, routineStep, matchedConcerns, skinAnalysis) {
  const concernText =
    matchedConcerns.length > 0
      ? ` It matches ${matchedConcerns.slice(0, 3).join(", ")}.`
      : "";

  const skinType =
    typeof skinAnalysis?.skinType === "string" && skinAnalysis.skinType.trim()
      ? skinAnalysis.skinType.trim()
      : "the user's";

  return `${product.name} was selected for the ${routineStep.category} step because it is suitable for ${skinType} skin.${concernText}`;
}

function sortCandidates(candidates, budgetRemaining) {
  return [...candidates].sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    const firstPrice = safePrice(first.product.price);
    const secondPrice = safePrice(second.product.price);

    if (budgetRemaining > 0) {
      const firstFits = firstPrice === 0 || firstPrice <= budgetRemaining;
      const secondFits = secondPrice === 0 || secondPrice <= budgetRemaining;

      if (firstFits !== secondFits) {
        return firstFits ? -1 : 1;
      }
    }

    if (firstPrice === 0 && secondPrice > 0) return 1;
    if (secondPrice === 0 && firstPrice > 0) return -1;

    return firstPrice - secondPrice;
  });
}

function selectForStep({
  routineStep,
  skinAnalysis,
  questionnaire,
  selectedProductIds,
  budgetRemaining,
}) {
  const candidates = productCatalog
    .map((product, index) => {
      if (!productMatchesCategory(product, routineStep?.category)) {
        return null;
      }

      const id = createProductId(product, index);

      if (selectedProductIds.has(id)) {
        return null;
      }

      const scoring = scoreProduct(
        product,
        routineStep,
        skinAnalysis,
        questionnaire
      );

      return {
        product,
        index,
        id,
        ...scoring,
      };
    })
    .filter(Boolean);

  if (!candidates.length) {
    return {
      product: null,
      warning: `No matching product was found for ${routineStep?.category || "this step"}.`,
    };
  }

  const sorted = sortCandidates(candidates, budgetRemaining);
  let chosen = sorted[0];

  if (budgetRemaining > 0) {
    const fitting = sorted.find((candidate) => {
      const price = safePrice(candidate.product.price);
      return price === 0 || price <= budgetRemaining;
    });

    if (fitting) chosen = fitting;
  }

  const reason = buildReason(
    chosen.product,
    routineStep,
    chosen.matchedConcerns,
    skinAnalysis
  );

  return {
    product: normalizeProduct(
      chosen.product,
      chosen.index,
      reason,
      chosen.matchedConcerns
    ),
    warning: "",
  };
}

function enrichRoutineSection({
  steps,
  sectionName,
  skinAnalysis,
  questionnaire,
  selectedProductIds,
  budgetState,
}) {
  if (!Array.isArray(steps)) return [];

  return steps.map((step, index) => {
    const selection = selectForStep({
      routineStep: step,
      skinAnalysis,
      questionnaire,
      selectedProductIds,
      budgetRemaining:
        budgetState.totalBudget > 0
          ? Math.max(0, budgetState.totalBudget - budgetState.runningTotal)
          : 0,
    });

    if (selection.product) {
      selectedProductIds.add(selection.product.id);
      budgetState.runningTotal += safePrice(selection.product.price);
    }

    return {
      ...step,
      step:
        Number.isFinite(Number(step?.step)) && Number(step.step) > 0
          ? Number(step.step)
          : index + 1,
      section: sectionName,
      product: selection.product,
      selectionWarning: selection.warning,
    };
  });
}

function selectProductsForRoutine(
  routine,
  skinAnalysis = {},
  questionnaire = {}
) {
  if (!Array.isArray(productCatalog)) {
    throw new Error("productCatalog.js must export an array.");
  }

  const totalBudget = extractBudget(questionnaire);
  const selectedProductIds = new Set();
  const budgetState = {
    totalBudget,
    runningTotal: 0,
  };

  const morning = enrichRoutineSection({
    steps: routine?.morning,
    sectionName: "morning",
    skinAnalysis,
    questionnaire,
    selectedProductIds,
    budgetState,
  });

  const night = enrichRoutineSection({
    steps: routine?.night,
    sectionName: "night",
    skinAnalysis,
    questionnaire,
    selectedProductIds,
    budgetState,
  });

  const weekly = enrichRoutineSection({
    steps: routine?.weekly,
    sectionName: "weekly",
    skinAnalysis,
    questionnaire,
    selectedProductIds,
    budgetState,
  });

  const allProducts = [...morning, ...night, ...weekly]
    .map((step) => step.product)
    .filter(Boolean);

  const uniqueProducts = [];
  const seen = new Set();

  for (const product of allProducts) {
    if (!seen.has(product.id)) {
      seen.add(product.id);
      uniqueProducts.push(product);
    }
  }

  const missingSteps = [...morning, ...night, ...weekly]
    .filter((step) => !step.product)
    .map((step) => ({
      section: step.section,
      step: step.step,
      category: step.category,
      message: step.selectionWarning,
    }));

  const routineTotal = uniqueProducts.reduce(
    (total, product) => total + safePrice(product.price),
    0
  );

  const budgetStatus =
    totalBudget > 0
      ? routineTotal <= totalBudget
        ? "Within budget"
        : "Above budget"
      : "Budget not provided";

  return {
    routine: {
      morning,
      night,
      weekly,
    },
    products: uniqueProducts,
    missingSteps,
    budget: {
      detectedBudget: totalBudget,
      routineTotal,
      budgetStatus,
      currency: "INR",
    },
  };
}

module.exports = {
  selectProductsForRoutine,
  extractBudget,
  normalizeCategory,
};
