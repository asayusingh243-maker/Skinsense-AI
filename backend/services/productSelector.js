"use strict";

const productCatalog = require("../data/productCatalog");

const FALLBACK_PRODUCT_IMAGE =
  "/products/product-placeholder.png";

const MAX_ALTERNATIVES = 3;

/* -------------------------------------------------------------------------- */
/*                               CATEGORY ALIASES                             */
/* -------------------------------------------------------------------------- */

const CATEGORY_ALIASES = {
  cleanser: [
    "cleanser",
    "face wash",
    "facewash",
    "cleansing gel",
    "cleansing foam",
  ],

  moisturizer: [
    "moisturizer",
    "moisturiser",
    "cream",
    "gel moisturizer",
    "gel moisturiser",
    "barrier cream",
  ],

  sunscreen: [
    "sunscreen",
    "sun screen",
    "spf",
    "sun protection",
  ],

  "vitamin c": [
    "vitamin c",
    "vitamin c serum",
    "ascorbic acid",
    "ascorbyl",
  ],

  niacinamide: [
    "niacinamide",
    "niacinamide serum",
    "vitamin b3",
  ],

  "salicylic acid": [
    "salicylic acid",
    "salicylic acid serum",
    "bha",
    "bha serum",
  ],

  "hyaluronic acid": [
    "hyaluronic acid",
    "hyaluronic acid serum",
    "hydrating serum",
    "hydration serum",
    "sodium hyaluronate",
  ],

  retinol: [
    "retinol",
    "retinol serum",
    "retinoid",
    "retinal",
  ],

  "alpha arbutin": [
    "alpha arbutin",
    "alpha arbutin serum",
    "arbutin",
  ],

  "tranexamic acid": [
    "tranexamic acid",
    "tranexamic acid serum",
    "txa",
  ],

  "azelaic acid": [
    "azelaic acid",
    "azelaic acid serum",
    "azelaic",
  ],

  exfoliant: [
    "exfoliant",
    "exfoliating serum",
    "exfoliating treatment",
    "aha",
    "bha",
    "pha",
  ],

  "clay mask": [
    "clay mask",
    "kaolin mask",
    "charcoal mask",
  ],

  "ceramide moisturizer": [
    "ceramide moisturizer",
    "ceramide moisturiser",
    "barrier moisturizer",
    "barrier moisturiser",
    "barrier repair cream",
  ],
};

/* -------------------------------------------------------------------------- */
/*                         TREATMENT-SPECIFIC CATEGORIES                       */
/* -------------------------------------------------------------------------- */

const TREATMENT_CATEGORIES = new Set([
  "vitamin c",
  "niacinamide",
  "salicylic acid",
  "hyaluronic acid",
  "retinol",
  "alpha arbutin",
  "tranexamic acid",
  "azelaic acid",
]);

/* -------------------------------------------------------------------------- */
/*                                NORMALIZERS                                 */
/* -------------------------------------------------------------------------- */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/*
 * Important:
 *
 * We check exact aliases before partial aliases.
 *
 * This prevents a broad phrase from accidentally overriding a
 * treatment-specific request.
 */
function normalizeCategory(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  /*
   * First pass:
   * exact matches.
   */
  for (const [canonical, aliases] of Object.entries(
    CATEGORY_ALIASES
  )) {
    if (canonical === normalized) {
      return canonical;
    }

    if (
      aliases.some(
        (alias) => normalizeText(alias) === normalized
      )
    ) {
      return canonical;
    }
  }

  /*
   * Treatment categories get priority.
   */
  const treatmentPriority = [
    "vitamin c",
    "niacinamide",
    "salicylic acid",
    "hyaluronic acid",
    "retinol",
    "alpha arbutin",
    "tranexamic acid",
    "azelaic acid",
  ];

  for (const canonical of treatmentPriority) {
    const aliases = CATEGORY_ALIASES[canonical] || [];

    if (
      normalizeText(normalized).includes(
        normalizeText(canonical)
      ) ||
      aliases.some((alias) =>
        normalized.includes(normalizeText(alias))
      )
    ) {
      return canonical;
    }
  }

  /*
   * General categories.
   */
  for (const [canonical, aliases] of Object.entries(
    CATEGORY_ALIASES
  )) {
    if (
      aliases.some((alias) => {
        const normalizedAlias = normalizeText(alias);

        return (
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

/* -------------------------------------------------------------------------- */
/*                            PRODUCT TEXT HELPERS                             */
/* -------------------------------------------------------------------------- */

function getProductCategory(product) {
  return normalizeCategory(
    product?.category ||
      product?.type ||
      product?.productType ||
      product?.routineCategory
  );
}

function buildProductSearchText(product) {
  return normalizeText(
    [
      product?.name,
      product?.category,
      product?.type,
      product?.productType,
      product?.routineCategory,
      product?.treatmentType,
      product?.activeIngredient,
      product?.strength,
      ...normalizeStringArray(product?.keyIngredients),
      ...normalizeStringArray(product?.benefits),
      ...normalizeStringArray(product?.concerns),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

/* -------------------------------------------------------------------------- */
/*                             TREATMENT DETECTION                             */
/* -------------------------------------------------------------------------- */

function productContainsTreatment(
  product,
  treatmentCategory
) {
  const productText = buildProductSearchText(product);

  const aliases =
    CATEGORY_ALIASES[treatmentCategory] || [];

  const searchTerms = [
    treatmentCategory,
    ...aliases,
  ].map(normalizeText);

  return searchTerms.some(
    (term) => term && productText.includes(term)
  );
}

/*
 * Prevent treatment-specific steps from receiving another active.
 *
 * Example:
 *
 * Vitamin C Serum
 *      ↓
 * Vitamin C product ✓
 * Retinol product   ✗
 */
function productMatchesTreatment(
  product,
  requestedCategory
) {
  if (!TREATMENT_CATEGORIES.has(requestedCategory)) {
    return false;
  }

  return productContainsTreatment(
    product,
    requestedCategory
  );
}

/* -------------------------------------------------------------------------- */
/*                             CATEGORY MATCHING                               */
/* -------------------------------------------------------------------------- */

function productMatchesCategory(
  product,
  requestedCategory
) {
  const normalizedRequested =
    normalizeCategory(requestedCategory);

  const productCategory =
    getProductCategory(product);

  if (!normalizedRequested) {
    return false;
  }

  /*
   * STRICT treatment matching.
   *
   * A serum being a "Serum" is not enough.
   * Its treatment/ingredient must match.
   */
  if (
    TREATMENT_CATEGORIES.has(
      normalizedRequested
    )
  ) {
    return productMatchesTreatment(
      product,
      normalizedRequested
    );
  }

  /*
   * Basic categories.
   */
  if (
    ["cleanser", "moisturizer", "sunscreen"].includes(
      normalizedRequested
    )
  ) {
    return productCategory === normalizedRequested;
  }

  /*
   * Ceramide moisturizer.
   */
  if (
    normalizedRequested ===
    "ceramide moisturizer"
  ) {
    if (productCategory !== "moisturizer") {
      return false;
    }

    const text = buildProductSearchText(product);

    return (
      text.includes("ceramide") ||
      text.includes("barrier")
    );
  }

  /*
   * Exfoliant.
   */
  if (normalizedRequested === "exfoliant") {
    const text = buildProductSearchText(product);

    return (
      text.includes("exfoliant") ||
      text.includes("exfoliating") ||
      text.includes("aha") ||
      text.includes("bha") ||
      text.includes("pha")
    );
  }

  /*
   * Clay mask.
   */
  if (normalizedRequested === "clay mask") {
    const text = buildProductSearchText(product);

    return (
      text.includes("clay mask") ||
      text.includes("kaolin") ||
      text.includes("charcoal mask")
    );
  }

  return productCategory === normalizedRequested;
}

/* -------------------------------------------------------------------------- */
/*                                PRICE HELPERS                                */
/* -------------------------------------------------------------------------- */

function safePrice(value) {
  const price = Number(value);

  return Number.isFinite(price) && price > 0
    ? Math.round(price)
    : 0;
}

function createProductId(product, index) {
  if (
    typeof product?.id === "string" &&
    product.id.trim()
  ) {
    return product.id.trim();
  }

  return `${
    product?.brand || "product"
  }-${product?.name || index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* -------------------------------------------------------------------------- */
/*                               BUDGET PARSER                                */
/* -------------------------------------------------------------------------- */

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
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 0
    ) {
      return Math.round(value);
    }

    if (typeof value === "string") {
      const matches = value
        .replace(/,/g, "")
        .match(/\d+(?:\.\d+)?/g);

      if (matches?.length) {
        const amounts = matches
          .map(Number)
          .filter(
            (amount) =>
              Number.isFinite(amount) &&
              amount > 0
          );

        if (amounts.length) {
          return Math.round(
            Math.max(...amounts)
          );
        }
      }
    }
  }

  return 0;
}

/* -------------------------------------------------------------------------- */
/*                              PROFILE BUILDER                               */
/* -------------------------------------------------------------------------- */

function buildProfileText(
  skinAnalysis = {},
  questionnaire = {}
) {
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

    ...(Array.isArray(
      skinAnalysis.mainConcerns
    )
      ? skinAnalysis.mainConcerns
      : []),

    ...(Array.isArray(
      skinAnalysis.concerns
    )
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

  return normalizeText(
    values.filter(Boolean).join(" ")
  );
}

function getEnvironmentNumber(
  questionnaire,
  field
) {
  const value = Number(
    questionnaire?.environment?.[field]
  );

  return Number.isFinite(value)
    ? value
    : 0;
}

/* -------------------------------------------------------------------------- */
/*                               PRODUCT SCORE                                */
/* -------------------------------------------------------------------------- */

function scoreProduct(
  product,
  routineStep,
  skinAnalysis,
  questionnaire,
  selectedBrands = new Set()
) {
  const profileText = buildProfileText(
    skinAnalysis,
    questionnaire
  );

  const skinType = normalizeText(
    skinAnalysis?.skinType
  );

  const productSkinTypes =
    normalizeStringArray(
      product?.skinTypes
    ).map(normalizeText);

  const productConcerns =
    normalizeStringArray(
      product?.concerns
    );

  const requestedCategory =
    normalizeCategory(
      routineStep?.category
    );

  let score = 0;

  const matchedConcerns = [];

  /*
   * Strong category score.
   */
  if (
    productMatchesCategory(
      product,
      requestedCategory
    )
  ) {
    score += 50;
  }

  /*
   * Treatment-specific bonus.
   */
  if (
    TREATMENT_CATEGORIES.has(
      requestedCategory
    ) &&
    productContainsTreatment(
      product,
      requestedCategory
    )
  ) {
    score += 25;
  }

  /*
   * Skin-type match.
   */
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

  /*
   * Sensitive skin support.
   */
  if (
    profileText.includes("sensitive") &&
    productSkinTypes.includes("sensitive")
  ) {
    score += 8;
  }

  /*
   * Concern matching.
   */
  for (const concern of productConcerns) {
    const normalizedConcern =
      normalizeText(concern);

    if (
      normalizedConcern &&
      profileText.includes(
        normalizedConcern
      )
    ) {
      matchedConcerns.push(concern);
      score += 5;
    }
  }

  /*
   * Ceramide bonus.
   */
  if (
    requestedCategory ===
    "ceramide moisturizer"
  ) {
    const text =
      buildProductSearchText(product);

    if (
      text.includes("ceramide") ||
      text.includes("barrier")
    ) {
      score += 15;
    }
  }

  /*
   * Environmental scoring.
   */
  const humidity =
    getEnvironmentNumber(
      questionnaire,
      "humidityPercent"
    );

  const uvIndex =
    getEnvironmentNumber(
      questionnaire,
      "uvIndex"
    );

  const aqi =
    getEnvironmentNumber(
      questionnaire,
      "aqi"
    );

  const productCategory =
    getProductCategory(product);

  if (
    productCategory === "sunscreen" &&
    uvIndex >= 3
  ) {
    score += 8;
  }

  if (
    productCategory === "moisturizer" &&
    humidity > 0 &&
    humidity <= 45
  ) {
    score += 5;
  }

  if (
    productCategory === "cleanser" &&
    (
      aqi >= 100 ||
      profileText.includes("acne") ||
      profileText.includes("oily")
    )
  ) {
    score += 4;
  }

  /*
   * Beginner friendliness.
   */
  const beginner =
    normalizeText(
      questionnaire?.routine
    ).includes("beginner") ||
    normalizeText(
      questionnaire?.experience
    ).includes("beginner");

  if (
    beginner &&
    (
      product?.beginnerFriendly === true ||
      normalizeText(
        product?.strength
      ).includes("beginner")
    )
  ) {
    score += 3;
  }

  /*
   * Verified product bonus.
   */
  if (
    product?.verified === true ||
    product?.isVerified === true
  ) {
    score += 3;
  }

  /*
   * Affordable product bonus.
   */
  const price =
    safePrice(product?.price);

  if (
    price > 0 &&
    price <= 700
  ) {
    score += 2;
  }

  /*
   * Brand diversity.
   *
   * This is deliberately a SMALL penalty.
   * We prefer variety but never sacrifice
   * treatment correctness for brand variety.
   */
  const brand =
    normalizeText(product?.brand);

  if (
    brand &&
    selectedBrands.has(brand)
  ) {
    score -= 6;
  }

  return {
    score,
    matchedConcerns,
  };
}

/* -------------------------------------------------------------------------- */
/*                             PRODUCT NORMALIZER                              */
/* -------------------------------------------------------------------------- */

function normalizeProduct(
  product,
  index,
  reason,
  matchedConcerns
) {
  return {
    id: createProductId(
      product,
      index
    ),

    brand:
      typeof product?.brand === "string"
        ? product.brand.trim()
        : "",

    name:
      typeof product?.name === "string"
        ? product.name.trim()
        : "",

    category:
      typeof product?.category === "string"
        ? product.category.trim()
        : "",

    size:
      typeof product?.size === "string"
        ? product.size.trim()
        : "",

    price:
      safePrice(product?.price),

    originalPrice:
      safePrice(
        product?.originalPrice
      ),

    currency: "INR",

    seller:
      typeof product?.seller === "string" &&
      product.seller.trim()
        ? product.seller.trim()
        : `${
            product?.brand || "Brand"
          } Official Website`,

    buyUrl:
      typeof product?.buyUrl === "string"
        ? product.buyUrl.trim()
        : typeof product?.buyLink === "string"
          ? product.buyLink.trim()
          : "",

    alternativeSeller:
      typeof product?.alternativeSeller ===
        "string"
        ? product.alternativeSeller.trim()
        : "",

    alternativeBuyUrl:
      typeof product?.alternativeBuyUrl ===
        "string"
        ? product.alternativeBuyUrl.trim()
        : "",

    imageUrl:
      typeof product?.imageUrl === "string" &&
      product.imageUrl.trim()
        ? product.imageUrl.trim()
        : typeof product?.image === "string" &&
            product.image.trim()
          ? product.image.trim()
          : FALLBACK_PRODUCT_IMAGE,

    reason,

    matchedConcerns,

    keyIngredients:
      normalizeStringArray(
        product?.keyIngredients
      ),

    usage:
      typeof product?.usage === "string" &&
      product.usage.trim()
        ? product.usage.trim()
        : "Use according to the routine step and patch-test before regular use.",

    warnings:
      normalizeStringArray(
        product?.warnings
      ).length > 0
        ? normalizeStringArray(
            product.warnings
          )
        : [
            "Patch-test before regular use.",
            "Stop use if persistent irritation occurs.",
          ],

    priceCheckedAt:
      typeof product?.priceCheckedAt ===
        "string"
        ? product.priceCheckedAt.trim()
        : "",
  };
}

/* -------------------------------------------------------------------------- */
/*                               REASON BUILDER                               */
/* -------------------------------------------------------------------------- */

function buildReason(
  product,
  routineStep,
  matchedConcerns,
  skinAnalysis,
  isAlternative = false
) {
  const concernText =
    matchedConcerns.length > 0
      ? ` It matches ${matchedConcerns
          .slice(0, 3)
          .join(", ")}.`
      : "";

  const skinType =
    typeof skinAnalysis?.skinType ===
      "string" &&
    skinAnalysis.skinType.trim()
      ? skinAnalysis.skinType.trim()
      : "the user's";

  if (isAlternative) {
    return `${product.name} is a suitable alternative for the ${routineStep.category} step for ${skinType} skin.${concernText}`;
  }

  return `${product.name} was selected for the ${routineStep.category} step because it is suitable for ${skinType} skin.${concernText}`;
}

/* -------------------------------------------------------------------------- */
/*                              SORT CANDIDATES                               */
/* -------------------------------------------------------------------------- */

function sortCandidates(
  candidates,
  budgetRemaining
) {
  return [...candidates].sort(
    (first, second) => {
      if (
        second.score !== first.score
      ) {
        return (
          second.score -
          first.score
        );
      }

      const firstPrice =
        safePrice(
          first.product.price
        );

      const secondPrice =
        safePrice(
          second.product.price
        );

      if (budgetRemaining > 0) {
        const firstFits =
          firstPrice === 0 ||
          firstPrice <=
            budgetRemaining;

        const secondFits =
          secondPrice === 0 ||
          secondPrice <=
            budgetRemaining;

        if (
          firstFits !== secondFits
        ) {
          return firstFits
            ? -1
            : 1;
        }
      }

      /*
       * Prefer known prices when scores tie.
       */
      if (
        firstPrice === 0 &&
        secondPrice > 0
      ) {
        return 1;
      }

      if (
        secondPrice === 0 &&
        firstPrice > 0
      ) {
        return -1;
      }

      return (
        firstPrice -
        secondPrice
      );
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                         ALTERNATIVE PRODUCT BUILDER                         */
/* -------------------------------------------------------------------------- */

function buildAlternatives({
  sortedCandidates,
  chosen,
  routineStep,
  skinAnalysis,
}) {
  if (!chosen) {
    return [];
  }

  const remaining =
    sortedCandidates.filter(
      (candidate) =>
        candidate.id !==
        chosen.id
    );

  /*
   * Prefer a different brand from the primary.
   */
  const chosenBrand =
    normalizeText(
      chosen.product?.brand
    );

  const differentBrand =
    remaining.filter(
      (candidate) =>
        normalizeText(
          candidate.product?.brand
        ) !== chosenBrand
    );

  const sameBrand =
    remaining.filter(
      (candidate) =>
        normalizeText(
          candidate.product?.brand
        ) === chosenBrand
    );

  const ordered = [
    ...differentBrand,
    ...sameBrand,
  ];

  const alternatives = [];

  const usedBrands =
    new Set();

  /*
   * First pass:
   * maximize brand diversity.
   */
  for (const candidate of ordered) {
    if (
      alternatives.length >=
      MAX_ALTERNATIVES
    ) {
      break;
    }

    const brand =
      normalizeText(
        candidate.product?.brand
      );

    if (
      brand &&
      usedBrands.has(brand)
    ) {
      continue;
    }

    const reason =
      buildReason(
        candidate.product,
        routineStep,
        candidate.matchedConcerns,
        skinAnalysis,
        true
      );

    alternatives.push(
      normalizeProduct(
        candidate.product,
        candidate.index,
        reason,
        candidate.matchedConcerns
      )
    );

    if (brand) {
      usedBrands.add(brand);
    }
  }

  /*
   * Second pass:
   * If fewer than 3 alternatives exist,
   * fill remaining slots even if a brand repeats.
   */
  if (
    alternatives.length <
    MAX_ALTERNATIVES
  ) {
    const usedIds = new Set(
      alternatives.map(
        (product) => product.id
      )
    );

    for (const candidate of ordered) {
      if (
        alternatives.length >=
        MAX_ALTERNATIVES
      ) {
        break;
      }

      if (
        usedIds.has(
          candidate.id
        )
      ) {
        continue;
      }

      const reason =
        buildReason(
          candidate.product,
          routineStep,
          candidate.matchedConcerns,
          skinAnalysis,
          true
        );

      const normalized =
        normalizeProduct(
          candidate.product,
          candidate.index,
          reason,
          candidate.matchedConcerns
        );

      alternatives.push(
        normalized
      );

      usedIds.add(
        normalized.id
      );
    }
  }

  return alternatives;
}

/* -------------------------------------------------------------------------- */
/*                              SELECT FOR STEP                               */
/* -------------------------------------------------------------------------- */

function selectForStep({
  routineStep,
  skinAnalysis,
  questionnaire,
  selectedProductIds,
  selectedBrands,
  budgetRemaining,
}) {
  const candidates =
    productCatalog
      .map(
        (product, index) => {
          if (
            !productMatchesCategory(
              product,
              routineStep?.category
            )
          ) {
            return null;
          }

          const id =
            createProductId(
              product,
              index
            );

          /*
           * Primary routine products should
           * not repeat.
           */
          if (
            selectedProductIds.has(id)
          ) {
            return null;
          }

          const scoring =
            scoreProduct(
              product,
              routineStep,
              skinAnalysis,
              questionnaire,
              selectedBrands
            );

          return {
            product,
            index,
            id,
            ...scoring,
          };
        }
      )
      .filter(Boolean);

  if (!candidates.length) {
    return {
      product: null,
      alternatives: [],
      warning:
        `No matching product was found for ${
          routineStep?.category ||
          "this step"
        }.`,
    };
  }

  const sorted =
    sortCandidates(
      candidates,
      budgetRemaining
    );

  let chosen = sorted[0];

  /*
   * Respect available routine budget.
   */
  if (budgetRemaining > 0) {
    const fitting =
      sorted.find(
        (candidate) => {
          const price =
            safePrice(
              candidate.product
                .price
            );

          return (
            price === 0 ||
            price <=
              budgetRemaining
          );
        }
      );

    if (fitting) {
      chosen = fitting;
    }
  }

  const reason =
    buildReason(
      chosen.product,
      routineStep,
      chosen.matchedConcerns,
      skinAnalysis
    );

  const primaryProduct =
    normalizeProduct(
      chosen.product,
      chosen.index,
      reason,
      chosen.matchedConcerns
    );

  const alternatives =
    buildAlternatives({
      sortedCandidates: sorted,
      chosen,
      routineStep,
      skinAnalysis,
    });

  return {
    product: primaryProduct,
    alternatives,
    warning: "",
  };
}

/* -------------------------------------------------------------------------- */
/*                           ENRICH ROUTINE SECTION                            */
/* -------------------------------------------------------------------------- */

function enrichRoutineSection({
  steps,
  sectionName,
  skinAnalysis,
  questionnaire,
  selectedProductIds,
  selectedBrands,
  budgetState,
}) {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map(
    (step, index) => {
      const budgetRemaining =
        budgetState.totalBudget > 0
          ? Math.max(
              0,
              budgetState.totalBudget -
                budgetState.runningTotal
            )
          : 0;

      const selection =
        selectForStep({
          routineStep: step,
          skinAnalysis,
          questionnaire,
          selectedProductIds,
          selectedBrands,
          budgetRemaining,
        });

      if (selection.product) {
        selectedProductIds.add(
          selection.product.id
        );

        const brand =
          normalizeText(
            selection.product.brand
          );

        if (brand) {
          selectedBrands.add(
            brand
          );
        }

        budgetState.runningTotal +=
          safePrice(
            selection.product.price
          );
      }

      return {
        ...step,

        step:
          Number.isFinite(
            Number(step?.step)
          ) &&
          Number(step.step) > 0
            ? Number(step.step)
            : index + 1,

        section: sectionName,

        product:
          selection.product,

        alternatives:
          Array.isArray(
            selection.alternatives
          )
            ? selection.alternatives
            : [],

        selectionWarning:
          selection.warning,
      };
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                         SELECT PRODUCTS FOR ROUTINE                         */
/* -------------------------------------------------------------------------- */

function selectProductsForRoutine(
  routine,
  skinAnalysis = {},
  questionnaire = {}
) {
  if (
    !Array.isArray(
      productCatalog
    )
  ) {
    throw new Error(
      "productCatalog.js must export an array."
    );
  }

  const totalBudget =
    extractBudget(
      questionnaire
    );

  const selectedProductIds =
    new Set();

  /*
   * Tracks brands already chosen as primary
   * recommendations.
   */
  const selectedBrands =
    new Set();

  const budgetState = {
    totalBudget,
    runningTotal: 0,
  };

  const morning =
    enrichRoutineSection({
      steps:
        routine?.morning,

      sectionName:
        "morning",

      skinAnalysis,

      questionnaire,

      selectedProductIds,

      selectedBrands,

      budgetState,
    });

  const night =
    enrichRoutineSection({
      steps:
        routine?.night,

      sectionName:
        "night",

      skinAnalysis,

      questionnaire,

      selectedProductIds,

      selectedBrands,

      budgetState,
    });

  const weekly =
    enrichRoutineSection({
      steps:
        routine?.weekly,

      sectionName:
        "weekly",

      skinAnalysis,

      questionnaire,

      selectedProductIds,

      selectedBrands,

      budgetState,
    });

  /*
   * Primary products only.
   *
   * Alternatives are intentionally NOT counted
   * in routineTotal because the user would buy
   * one option, not every alternative.
   */
  const allProducts = [
    ...morning,
    ...night,
    ...weekly,
  ]
    .map(
      (step) =>
        step.product
    )
    .filter(Boolean);

  const uniqueProducts = [];

  const seen = new Set();

  for (
    const product
    of allProducts
  ) {
    if (
      !seen.has(product.id)
    ) {
      seen.add(
        product.id
      );

      uniqueProducts.push(
        product
      );
    }
  }

  const missingSteps = [
    ...morning,
    ...night,
    ...weekly,
  ]
    .filter(
      (step) =>
        !step.product
    )
    .map(
      (step) => ({
        section:
          step.section,

        step:
          step.step,

        category:
          step.category,

        message:
          step.selectionWarning,
      })
    );

  const routineTotal =
    uniqueProducts.reduce(
      (total, product) =>
        total +
        safePrice(
          product.price
        ),
      0
    );

  const budgetStatus =
    totalBudget > 0
      ? routineTotal <=
        totalBudget
        ? "Within budget"
        : "Above budget"
      : "Budget not provided";

  return {
    routine: {
      morning,
      night,
      weekly,
    },

    products:
      uniqueProducts,

    missingSteps,

    budget: {
      detectedBudget:
        totalBudget,

      routineTotal,

      budgetStatus,

      currency: "INR",
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

module.exports = {
  selectProductsForRoutine,
  extractBudget,
  normalizeCategory,
};