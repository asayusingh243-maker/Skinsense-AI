const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const productCatalog = require("../data/productCatalog");

const { analyzeSkinImage } = require("../services/analysisService");
const { buildRoutine } = require("../services/routineBuilder");
const { selectProductsForRoutine } = require("../services/productSelector");
const { validateRoutineSafety } = require("../services/safetyEngine");
const { optimizeRoutineForBudget } = require("../services/budgetEngine");
const { applyWeatherGuidance } = require("../services/weatherEngine");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const ANALYSIS_MODEL =
  process.env.GEMINI_ANALYSIS_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";


const FALLBACK_PRODUCT_IMAGE =
  "/products/product-placeholder.png";

const productImageCache = new Map();

/* -------------------------------------------------------------------------- */
/*                                  Schemas                                   */
/* -------------------------------------------------------------------------- */

const fallbackProductSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    brand: {
      type: "string",
    },
    name: {
      type: "string",
    },
    category: {
      type: "string",
    },
    size: {
      type: "string",
    },
    price: {
      type: "integer",
      description:
        "Approximate price in Indian rupees. Use 0 when unknown.",
    },
    currency: {
      type: "string",
    },
    reason: {
      type: "string",
    },
    matchedConcerns: {
      type: "array",
      items: {
        type: "string",
      },
    },
    keyIngredients: {
      type: "array",
      items: {
        type: "string",
      },
    },
    usage: {
      type: "string",
    },
    warnings: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [
    "brand",
    "name",
    "category",
    "price",
    "currency",
    "reason",
  ],
};

const skinAnalysisSchema = {
  type: "object",
  properties: {
    skinType: {
      type: "string",
      description:
        "Likely visible skin type, such as oily, dry, combination, normal or sensitive.",
    },
    skinTone: {
      type: "string",
    },
    undertone: {
      type: "string",
    },
    skinScore: {
      type: "integer",
      description:
        "A general cosmetic skin-wellness score from 0 to 100. It is not a medical score.",
    },
    skinAge: {
      type: "string",
    },
    acne: {
      type: "string",
    },
    pigmentation: {
      type: "string",
    },
    pores: {
      type: "string",
    },
    hydration: {
      type: "string",
    },
    oiliness: {
      type: "string",
    },
    sensitivity: {
      type: "string",
    },
    mainConcerns: {
      type: "array",
      items: {
        type: "string",
      },
    },
    morningRoutine: {
      type: "array",
      items: {
        type: "string",
      },
    },
    nightRoutine: {
      type: "array",
      items: {
        type: "string",
      },
    },
    foods: {
      type: "array",
      items: {
        type: "string",
      },
    },
    ingredients: {
      type: "array",
      items: {
        type: "string",
      },
    },
    avoidIngredients: {
      type: "array",
      items: {
        type: "string",
      },
    },

    /*
      These suggestions are produced in the first Gemini request.
      They are only used if the grounded product-search request fails.
    */
    fallbackProducts: {
      type: "array",
      items: fallbackProductSchema,
    },
  },
  required: [
    "skinType",
    "skinTone",
    "undertone",
    "skinScore",
    "skinAge",
    "acne",
    "pigmentation",
    "pores",
    "hydration",
    "oiliness",
    "sensitivity",
    "mainConcerns",
    "morningRoutine",
    "nightRoutine",
    "foods",
    "ingredients",
    "avoidIngredients",
    "fallbackProducts",
  ],
};

const productRecommendationSchema = {
  type: "object",
  properties: {
    detectedBudget: {
      type: "integer",
      description:
        "Total skincare budget in Indian rupees. Return 0 if it was not provided.",
    },
    budgetStatus: {
      type: "string",
      description:
        "Whether the complete recommended routine is within the user's total budget.",
    },
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          brand: {
            type: "string",
          },
          name: {
            type: "string",
          },
          category: {
            type: "string",
          },
          size: {
            type: "string",
          },
          price: {
            type: "integer",
            description:
              "Current displayed selling price in Indian rupees. Return 0 when it cannot be verified.",
          },
          originalPrice: {
            type: "integer",
            description:
              "Original MRP in Indian rupees. Return 0 when unavailable.",
          },
          currency: {
            type: "string",
          },
          seller: {
            type: "string",
          },
          buyUrl: {
            type: "string",
            description:
              "Direct product-detail page for the exact product. Use an empty string when it cannot be verified.",
          },
          alternativeSeller: {
            type: "string",
          },
          alternativeBuyUrl: {
            type: "string",
          },
          imageUrl: {
            type: "string",
            description:
              "Direct public image URL for the exact product. Use an empty string when it cannot be verified.",
          },
          reason: {
            type: "string",
          },
          matchedConcerns: {
            type: "array",
            items: {
              type: "string",
            },
          },
          keyIngredients: {
            type: "array",
            items: {
              type: "string",
            },
          },
          usage: {
            type: "string",
          },
          warnings: {
            type: "array",
            items: {
              type: "string",
            },
          },
          priceCheckedAt: {
            type: "string",
          },
        },
        required: [
          "id",
          "brand",
          "name",
          "category",
          "size",
          "price",
          "originalPrice",
          "currency",
          "seller",
          "buyUrl",
          "alternativeSeller",
          "alternativeBuyUrl",
          "imageUrl",
          "reason",
          "matchedConcerns",
          "keyIngredients",
          "usage",
          "warnings",
          "priceCheckedAt",
        ],
      },
    },
    priceDisclaimer: {
      type: "string",
    },
  },
  required: [
    "detectedBudget",
    "budgetStatus",
    "products",
    "priceDisclaimer",
  ],
};

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function getResponseText(response) {
  if (
    typeof response?.text === "string" &&
    response.text.trim()
  ) {
    return response.text.trim();
  }

  const parts =
    response?.candidates?.[0]?.content?.parts || [];

  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
}

function parseGeminiJson(response, responseName) {
  const responseText = getResponseText(response);

  if (!responseText) {
    throw new Error(
      `${responseName} returned an empty response.`
    );
  }

  const cleaned = responseText
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting an object from explanatory text.
  }

  const firstObjectBracket = cleaned.indexOf("{");
  const lastObjectBracket = cleaned.lastIndexOf("}");

  if (
    firstObjectBracket !== -1 &&
    lastObjectBracket > firstObjectBracket
  ) {
    try {
      return JSON.parse(
        cleaned.slice(
          firstObjectBracket,
          lastObjectBracket + 1
        )
      );
    } catch {
      // Continue to the final error.
    }
  }

  console.error(
    `${responseName} returned invalid JSON:`,
    cleaned.slice(0, 3000)
  );

  throw new Error(
    `${responseName} returned invalid JSON.`
  );
}

function safeHttpUrl(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  try {
    const parsedUrl = new URL(value.trim());

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return "";
    }

    return parsedUrl.toString();
  } catch {
    return "";
  }
}

function safeImageUrl(value) {
  if (
    typeof value === "string" &&
    value.trim().startsWith("/")
  ) {
    return value.trim();
  }

  return safeHttpUrl(value);
}

function safePublicProductUrl(value) {
  const safeUrl = safeHttpUrl(value);

  if (!safeUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(safeUrl);
    const hostname =
      parsedUrl.hostname.toLowerCase();

    const isPrivateHost =
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(
        hostname
      );

    return isPrivateHost
      ? ""
      : parsedUrl.toString();
  } catch {
    return "";
  }
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractMetaContent(
  html,
  attributeName,
  attributeValue
) {
  const escapedName =
    attributeName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const escapedValue =
    attributeValue.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const patterns = [
    new RegExp(
      `<meta[^>]+${escapedName}=["']${escapedValue}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${escapedName}=["']${escapedValue}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(
        match[1].trim()
      );
    }
  }

  return "";
}

function findImageInJsonLd(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return safeHttpUrl(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const image =
        findImageInJsonLd(item);

      if (image) {
        return image;
      }
    }

    return "";
  }

  if (typeof value !== "object") {
    return "";
  }

  const preferredFields = [
    "image",
    "primaryImageOfPage",
    "thumbnailUrl",
    "contentUrl",
  ];

  for (const field of preferredFields) {
    if (!(field in value)) {
      continue;
    }

    const image =
      findImageInJsonLd(value[field]);

    if (image) {
      return image;
    }
  }

  if (
    typeof value.url === "string" &&
    /\.(?:png|jpe?g|webp|avif)(?:\?|$)/i.test(
      value.url
    )
  ) {
    return safeHttpUrl(value.url);
  }

  return "";
}

function extractJsonLdImage(html) {
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;

  while ((match = pattern.exec(html))) {
    try {
      const parsed = JSON.parse(
        decodeHtmlEntities(
          match[1].trim()
        )
      );

      const image =
        findImageInJsonLd(parsed);

      if (image) {
        return image;
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  return "";
}

async function fetchProductPageImage(
  productPageUrl
) {
  const safePageUrl =
    safePublicProductUrl(
      productPageUrl
    );

  if (!safePageUrl) {
    return "";
  }

  if (
    productImageCache.has(
      safePageUrl
    )
  ) {
    return (
      productImageCache.get(
        safePageUrl
      ) || ""
    );
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    10000
  );

  try {
    const response = await fetch(
      safePageUrl,
      {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml",
        },
      }
    );

    if (!response.ok) {
      productImageCache.set(
        safePageUrl,
        ""
      );

      return "";
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType
        .toLowerCase()
        .includes("text/html")
    ) {
      productImageCache.set(
        safePageUrl,
        ""
      );

      return "";
    }

    const html =
      await response.text();

    const rawImageUrl =
      extractMetaContent(
        html,
        "property",
        "og:image:secure_url"
      ) ||
      extractMetaContent(
        html,
        "property",
        "og:image"
      ) ||
      extractMetaContent(
        html,
        "name",
        "twitter:image"
      ) ||
      extractMetaContent(
        html,
        "name",
        "twitter:image:src"
      ) ||
      extractJsonLdImage(html);

    if (!rawImageUrl) {
      productImageCache.set(
        safePageUrl,
        ""
      );

      return "";
    }

    const resolvedImageUrl =
      safeHttpUrl(
        new URL(
          rawImageUrl,
          response.url || safePageUrl
        ).toString()
      );

    productImageCache.set(
      safePageUrl,
      resolvedImageUrl
    );

    return resolvedImageUrl;
  } catch (error) {
    console.warn(
      "Automatic product image extraction failed:",
      getErrorMessage(error)
    );

    productImageCache.set(
      safePageUrl,
      ""
    );

    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function attachAutomaticProductImages(
  products
) {
  if (!Array.isArray(products)) {
    return [];
  }

  return Promise.all(
    products.map(async (product) => {
      const extractedImageUrl =
        await fetchProductPageImage(
          product.buyUrl
        );

      const existingImageUrl =
        product.imageUrl !==
        FALLBACK_PRODUCT_IMAGE
          ? safeImageUrl(
              product.imageUrl
            )
          : "";

      return {
        ...product,
        imageUrl:
          extractedImageUrl ||
          existingImageUrl ||
          FALLBACK_PRODUCT_IMAGE,
      };
    })
  );
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) => typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

function createProductId(product, index) {
  if (
    typeof product.id === "string" &&
    product.id.trim()
  ) {
    return product.id.trim();
  }

  const value = `${
    product.brand || "product"
  }-${product.name || index + 1}`;

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractBudget(questionnaire) {
  const possibleBudgetFields = [
    questionnaire?.totalBudget,
    questionnaire?.budget,
    questionnaire?.skincareBudget,
    questionnaire?.monthlyBudget,
    questionnaire?.productBudget,
    questionnaire?.budgetRange,
    questionnaire?.routineBudget,
  ];

  for (const value of possibleBudgetFields) {
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 0
    ) {
      return Math.round(value);
    }

    if (typeof value === "string") {
      const normalizedValue =
        value.replace(/,/g, "");

      const matches =
        normalizedValue.match(
          /\d+(?:\.\d+)?/g
        );

      if (matches?.length) {
        const amounts = matches
          .map(Number)
          .filter(
            (amount) =>
              Number.isFinite(amount) &&
              amount > 0
          );

        if (amounts.length > 0) {
          // For ₹500–₹1000, use ₹1000 as the total limit.
          return Math.round(
            Math.max(...amounts)
          );
        }
      }
    }
  }

  return 0;
}

function normalizeProducts(products) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .slice(0, 4)
    .map((product, index) => {
      const price = Number(product.price);

      const originalPrice = Number(
        product.originalPrice
      );

      const warnings =
        normalizeStringArray(
          product.warnings
        );

      return {
        id: createProductId(
          product,
          index
        ),

        brand:
          typeof product.brand ===
            "string"
            ? product.brand.trim()
            : "",

        name:
          typeof product.name ===
            "string"
            ? product.name.trim()
            : "",

        category:
          typeof product.category ===
            "string"
            ? product.category.trim()
            : "",

        size:
          typeof product.size ===
            "string"
            ? product.size.trim()
            : "",

        price:
          Number.isFinite(price) &&
          price > 0
            ? Math.round(price)
            : 0,

        originalPrice:
          Number.isFinite(
            originalPrice
          ) &&
          originalPrice > 0
            ? Math.round(
                originalPrice
              )
            : 0,

        currency: "INR",

        seller:
          typeof product.seller ===
            "string"
            ? product.seller.trim()
            : "",

        buyUrl: safePublicProductUrl(
          product.buyUrl
        ),

        alternativeSeller:
          typeof product.alternativeSeller ===
            "string"
            ? product.alternativeSeller.trim()
            : "",

        alternativeBuyUrl:
          safePublicProductUrl(
            product.alternativeBuyUrl
          ),

        imageUrl:
          safeImageUrl(
            product.imageUrl
          ) ||
          FALLBACK_PRODUCT_IMAGE,

        reason:
          typeof product.reason ===
            "string" &&
          product.reason.trim()
            ? product.reason.trim()
            : "Selected according to your skin analysis and budget.",

        matchedConcerns:
          normalizeStringArray(
            product.matchedConcerns
          ),

        keyIngredients:
          normalizeStringArray(
            product.keyIngredients
          ),

        usage:
          typeof product.usage ===
            "string"
            ? product.usage.trim()
            : "",

        warnings:
          warnings.length > 0
            ? warnings
            : [
                "Patch-test before regular use.",
              ],

        priceCheckedAt:
          typeof product.priceCheckedAt ===
            "string" &&
          product.priceCheckedAt.trim()
            ? product.priceCheckedAt.trim()
            : new Date().toISOString(),
      };
    })
    .filter(
      (product) =>
        product.brand &&
        product.name
    );
}

function normalizeFallbackProducts(
  products
) {
  return normalizeProducts(
    Array.isArray(products)
      ? products.map((product) => ({
          ...product,
          originalPrice: 0,
          seller:
            "Check official retailer",
          buyUrl: "",
          alternativeSeller: "",
          alternativeBuyUrl: "",
          imageUrl: "",
          priceCheckedAt: "",
        }))
      : []
  );
}

function createProductContext(
  questionnaire
) {
  return {
    age: questionnaire?.age || "",
    gender:
      questionnaire?.gender || "",
    skinFeeling:
      questionnaire?.skinFeeling || "",
    acne: questionnaire?.acne || "",
    pigmentation:
      questionnaire?.pigmentation ||
      "",
    pores:
      questionnaire?.pores || "",
    sensitiveSkin:
      questionnaire?.sensitiveSkin ||
      "",
    oiliness:
      questionnaire?.oiliness || "",
    sunExposure:
      questionnaire?.sunExposure || "",
    makeupUsage:
      questionnaire?.makeupUsage || "",
    faceWash:
      questionnaire?.faceWash || "",
    sleep:
      questionnaire?.sleep || "",
    water:
      questionnaire?.water || "",
    stress:
      questionnaire?.stress || "",
    exercise:
      questionnaire?.exercise || "",
    sunscreen:
      questionnaire?.sunscreen || "",
    routine:
      questionnaire?.routine || "",
    budget:
      questionnaire?.budget || "",
    city:
      questionnaire?.city || "",
    country:
      questionnaire?.country || "",
    climate:
      questionnaire?.climate || "",
    outdoorTime:
      questionnaire?.outdoorTime || "",
    environment:
      questionnaire?.environment ||
      null,
  };
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractMetaContent(
  html,
  attributeName,
  attributeValue
) {
  const escapedName =
    attributeName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const escapedValue =
    attributeValue.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const patterns = [
    new RegExp(
      `<meta[^>]+${escapedName}=["']${escapedValue}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${escapedName}=["']${escapedValue}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(
        match[1].trim()
      );
    }
  }

  return "";
}

async function fetchProductPageImage(
  productPageUrl
) {
  const safePageUrl =
    safePublicProductUrl(
      productPageUrl
    );

  if (!safePageUrl) {
    return "";
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    8000
  );

  try {
    const response = await fetch(
      safePageUrl,
      {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml",
        },
      }
    );

    if (!response.ok) {
      return "";
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType
        .toLowerCase()
        .includes("text/html")
    ) {
      return "";
    }

    const html =
      await response.text();

    const rawImageUrl =
      extractMetaContent(
        html,
        "property",
        "og:image:secure_url"
      ) ||
      extractMetaContent(
        html,
        "property",
        "og:image"
      ) ||
      extractMetaContent(
        html,
        "name",
        "twitter:image"
      ) ||
      extractMetaContent(
        html,
        "name",
        "twitter:image:src"
      );

    if (!rawImageUrl) {
      return "";
    }

    try {
      return safeHttpUrl(
        new URL(
          rawImageUrl,
          response.url ||
            safePageUrl
        ).toString()
      );
    } catch {
      return "";
    }
  } catch (error) {
    console.warn(
      "Could not read product image metadata:",
      getErrorMessage(error)
    );

    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function addMissingProductImages(
  products
) {
  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return [];
  }

  return Promise.all(
    products.map(async (product) => {
      if (
        product.imageUrl &&
        product.imageUrl !==
          FALLBACK_PRODUCT_IMAGE
      ) {
        return product;
      }

      if (!product.buyUrl) {
        return product;
      }

      const imageUrl =
        await fetchProductPageImage(
          product.buyUrl
        );

      return {
        ...product,
        imageUrl:
          imageUrl ||
          FALLBACK_PRODUCT_IMAGE,
      };
    })
  );
}

function extractSearchSources(
  response
) {
  const sources = [];

  const groundingChunks =
    response?.candidates?.[0]
      ?.groundingMetadata
      ?.groundingChunks || [];

  for (const chunk of groundingChunks) {
    if (chunk.web?.uri) {
      sources.push({
        title:
          chunk.web.title ||
          "Web source",
        url: chunk.web.uri,
      });
    }

    if (chunk.image?.sourceUri) {
      sources.push({
        title:
          chunk.image.title ||
          "Product image source",
        url: chunk.image.sourceUri,
        imageUrl:
          chunk.image.imageUri || "",
      });
    }
  }

  const urlMetadata =
    response?.candidates?.[0]
      ?.urlContextMetadata
      ?.urlMetadata || [];

  for (const item of urlMetadata) {
    if (item.retrievedUrl) {
      sources.push({
        title:
          "Verified product page",
        url: item.retrievedUrl,
        status:
          item.urlRetrievalStatus ||
          "",
      });
    }
  }

  const uniqueSources = [];
  const seenUrls = new Set();

  for (const source of sources) {
    if (
      source.url &&
      !seenUrls.has(source.url)
    ) {
      seenUrls.add(source.url);
      uniqueSources.push(source);
    }
  }

  return uniqueSources.slice(0, 15);
}


function normalizeMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSkinProfileText(
  skinAnalysis,
  questionnaire
) {
  const values = [
    skinAnalysis?.skinType,
    skinAnalysis?.acne,
    skinAnalysis?.pigmentation,
    skinAnalysis?.pores,
    skinAnalysis?.hydration,
    skinAnalysis?.oiliness,
    skinAnalysis?.sensitivity,
    ...(Array.isArray(
      skinAnalysis?.mainConcerns
    )
      ? skinAnalysis.mainConcerns
      : []),

    questionnaire?.skinFeeling,
    questionnaire?.acne,
    questionnaire?.pigmentation,
    questionnaire?.pores,
    questionnaire?.sensitiveSkin,
    questionnaire?.oiliness,
    questionnaire?.sunExposure,
    questionnaire?.climate,
    questionnaire?.outdoorTime,
  ];

  return normalizeMatchText(
    values.filter(Boolean).join(" ")
  );
}

function getEnvironmentNumber(
  questionnaire,
  field
) {
  const value =
    questionnaire?.environment?.[field];

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function scoreCatalogProduct(
  product,
  skinAnalysis,
  questionnaire
) {
  const profileText =
    buildSkinProfileText(
      skinAnalysis,
      questionnaire
    );

  const skinType =
    normalizeMatchText(
      skinAnalysis?.skinType
    );

  const catalogSkinTypes =
    normalizeStringArray(
      product.skinTypes
    ).map(normalizeMatchText);

  const catalogConcerns =
    normalizeStringArray(
      product.concerns
    );

  let score = 0;

  if (
    skinType &&
    catalogSkinTypes.some(
      (item) =>
        item === skinType ||
        skinType.includes(item) ||
        item.includes(skinType)
    )
  ) {
    score += 12;
  }

  if (
    profileText.includes("sensitive") &&
    catalogSkinTypes.includes(
      "sensitive"
    )
  ) {
    score += 5;
  }

  const matchedConcerns =
    catalogConcerns.filter(
      (concern) => {
        const normalizedConcern =
          normalizeMatchText(concern);

        return (
          normalizedConcern &&
          profileText.includes(
            normalizedConcern
          )
        );
      }
    );

  score +=
    matchedConcerns.length * 4;

  const category =
    normalizeMatchText(
      product.category
    );

  if (
    [
      "cleanser",
      "moisturizer",
      "sunscreen",
    ].includes(category)
  ) {
    score += 2;
  }

  const uvIndex =
    getEnvironmentNumber(
      questionnaire,
      "uvIndex"
    );

  const humidity =
    getEnvironmentNumber(
      questionnaire,
      "humidityPercent"
    );

  const aqi =
    getEnvironmentNumber(
      questionnaire,
      "aqi"
    );

  if (
    category === "sunscreen" &&
    (
      uvIndex >= 3 ||
      profileText.includes(
        "sun exposure"
      ) ||
      profileText.includes(
        "mostly outdoors"
      )
    )
  ) {
    score += 6;
  }

  if (
    category === "moisturizer" &&
    (
      humidity > 0 &&
      humidity <= 45 ||
      profileText.includes(
        "dry"
      ) ||
      profileText.includes(
        "dehydration"
      )
    )
  ) {
    score += 5;
  }

  if (
    category === "cleanser" &&
    (
      aqi >= 100 ||
      profileText.includes(
        "oiliness"
      ) ||
      profileText.includes(
        "acne"
      )
    )
  ) {
    score += 4;
  }

  return {
    score,
    matchedConcerns,
  };
}

function buildCatalogReason(
  product,
  matchedConcerns,
  skinAnalysis
) {
  const skinType =
    typeof skinAnalysis?.skinType ===
      "string" &&
    skinAnalysis.skinType.trim()
      ? skinAnalysis.skinType.trim()
      : "your reported";

  const concernText =
    matchedConcerns.length > 0
      ? ` It also matches: ${matchedConcerns
          .slice(0, 3)
          .join(", ")}.`
      : "";

  return `${product.name} was selected from the verified local catalogue because its ${product.category.toLowerCase()} profile is suitable for ${skinType} skin.${concernText}`;
}

function normalizeCatalogProduct(
  product,
  index,
  matchedConcerns,
  skinAnalysis
) {
  return normalizeProducts([
    {
      ...product,

      id:
        product.id ||
        createProductId(
          product,
          index
        ),

      seller:
        product.seller ||
        `${product.brand} Official Website`,

      buyUrl:
        product.buyUrl ||
        product.buyLink ||
        "",

      imageUrl:
        product.imageUrl ||
        product.image ||
        "",

      reason:
        product.reason ||
        buildCatalogReason(
          product,
          matchedConcerns,
          skinAnalysis
        ),

      matchedConcerns,

      keyIngredients:
        product.keyIngredients ||
        [],

      usage:
        product.usage ||
        (
          normalizeMatchText(
            product.category
          ) === "sunscreen"
            ? "Apply as the final morning skincare step. Reapply when outdoors."
            : normalizeMatchText(
                  product.category
                ) === "cleanser"
              ? "Massage gently onto damp skin and rinse. Use once or twice daily according to tolerance."
              : "Apply to clean skin after cleansing. Use according to your routine and skin tolerance."
        ),

      warnings:
        product.warnings ||
        [
          "Patch-test before regular use.",
          "Stop use if persistent irritation occurs.",
        ],

      priceCheckedAt:
        product.priceCheckedAt ||
        "",
    },
  ])[0];
}

function chooseCatalogProducts(
  skinAnalysis,
  questionnaire,
  budget
) {
  if (
    !Array.isArray(productCatalog) ||
    productCatalog.length === 0
  ) {
    return [];
  }

  const scoredProducts =
    productCatalog
      .map(
        (product, index) => {
          const scoring =
            scoreCatalogProduct(
              product,
              skinAnalysis,
              questionnaire
            );

          return {
            product,
            index,
            ...scoring,
          };
        }
      )
      .sort((first, second) => {
        if (
          second.score !== first.score
        ) {
          return (
            second.score -
            first.score
          );
        }

        const firstPrice =
          Number(
            first.product.price
          ) || 0;

        const secondPrice =
          Number(
            second.product.price
          ) || 0;

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

        return firstPrice -
          secondPrice;
      });

  const selected = [];
  const selectedIds =
    new Set();

  let runningTotal = 0;

  const essentialCategories = [
    "cleanser",
    "moisturizer",
    "sunscreen",
  ];

  for (
    const category
    of essentialCategories
  ) {
    const candidates =
      scoredProducts.filter(
        (entry) =>
          normalizeMatchText(
            entry.product.category
          ) === category &&
          !selectedIds.has(
            entry.product.id
          )
      );

    if (
      candidates.length === 0
    ) {
      continue;
    }

    let chosen =
      candidates[0];

    if (budget > 0) {
      const fittingCandidate =
        candidates.find(
          (entry) => {
            const price =
              Number(
                entry.product.price
              ) || 0;

            return (
              price === 0 ||
              runningTotal +
                price <=
                budget
            );
          }
        );

      if (fittingCandidate) {
        chosen =
          fittingCandidate;
      }
    }

    selected.push(chosen);
    selectedIds.add(
      chosen.product.id
    );

    runningTotal +=
      Number(
        chosen.product.price
      ) || 0;
  }

  for (
    const entry
    of scoredProducts
  ) {
    if (
      selected.length >= 4
    ) {
      break;
    }

    if (
      selectedIds.has(
        entry.product.id
      )
    ) {
      continue;
    }

    const price =
      Number(
        entry.product.price
      ) || 0;

    if (
      budget > 0 &&
      price > 0 &&
      runningTotal + price >
        budget
    ) {
      continue;
    }

    selected.push(entry);
    selectedIds.add(
      entry.product.id
    );
    runningTotal += price;
  }

  return selected
    .slice(0, 4)
    .map(
      (
        entry,
        selectedIndex
      ) =>
        normalizeCatalogProduct(
          entry.product,
          selectedIndex,
          entry.matchedConcerns,
          skinAnalysis
        )
    )
    .filter(Boolean);
}

function getErrorMessage(error) {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return String(
    error || "Unknown error"
  );
}

function getErrorStatus(error) {
  if (
    !error ||
    typeof error !== "object"
  ) {
    return undefined;
  }

  if ("status" in error) {
    const status = Number(
      error.status
    );

    if (Number.isFinite(status)) {
      return status;
    }
  }

  if ("code" in error) {
    const code = Number(error.code);

    if (Number.isFinite(code)) {
      return code;
    }
  }

  return undefined;
}

function isQuotaError(error) {
  const status =
    getErrorStatus(error);

  const message =
    getErrorMessage(error)
      .toLowerCase();

  return (
    status === 429 ||
    message.includes(
      "resource_exhausted"
    ) ||
    message.includes("quota") ||
    message.includes(
      "rate limit"
    ) ||
    message.includes(
      "too many requests"
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Controller                                */
/* -------------------------------------------------------------------------- */

const analyzeSkin = async (req, res) => {
  try {
    const { questionnaire, image } = req.body;

    if (!questionnaire || typeof questionnaire !== "object") {
      return res.status(400).json({
        success: false,
        message: "Questionnaire data is required.",
      });
    }

    if (typeof image !== "string" || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Image is required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing from the backend environment.",
      });
    }

    const safeImageName = path.basename(image);
    const imagePath = path.join(__dirname, "../uploads", safeImageName);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: "Uploaded image was not found.",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Step 1: Gemini image analysis                                           */
    /* ---------------------------------------------------------------------- */

    const skinAnalysis = await analyzeSkinImage({
      imagePath,
      questionnaire,
    });

    /* ---------------------------------------------------------------------- */
    /* Step 2: Build category-based routine                                    */
    /* ---------------------------------------------------------------------- */

    const baseRoutine = buildRoutine(skinAnalysis, questionnaire);

    /* ---------------------------------------------------------------------- */
    /* Step 3: Attach verified local-catalogue products                        */
    /* ---------------------------------------------------------------------- */

    const selectedResult = selectProductsForRoutine(
      baseRoutine,
      skinAnalysis,
      questionnaire
    );

    /* ---------------------------------------------------------------------- */
    /* Step 4: Apply ingredient and user-safety rules                          */
    /* ---------------------------------------------------------------------- */

    const safetyResult = validateRoutineSafety(
      selectedResult.routine,
      skinAnalysis,
      questionnaire
    );

    /* ---------------------------------------------------------------------- */
    /* Step 5: Fit the complete routine to the user's total budget             */
    /* ---------------------------------------------------------------------- */

    const budgetResult = optimizeRoutineForBudget(
      safetyResult.routine,
      skinAnalysis,
      questionnaire
    );

    /* ---------------------------------------------------------------------- */
    /* Step 6: Apply weather and air-quality guidance                          */
    /* ---------------------------------------------------------------------- */

    const environment = questionnaire.environment || {};
    const weatherInput = {
      ...environment,
      location:
        environment.location ||
        questionnaire.city ||
        questionnaire.country ||
        "",
      source: environment.source || "Questionnaire weather data",
    };

    const weatherResult = applyWeatherGuidance(
      budgetResult.routine,
      weatherInput,
      questionnaire
    );

    const finalRoutine = weatherResult.routine;

    /* ---------------------------------------------------------------------- */
    /* Preserve the product cards expected by the current frontend            */
    /* ---------------------------------------------------------------------- */

    const uniqueProducts = [];
    const seenProductIds = new Set();

    for (const sectionName of ["morning", "night", "weekly"]) {
      for (const step of finalRoutine?.[sectionName] || []) {
        const product = step?.product;
        if (!product) continue;

        const productId =
          product.id || createProductId(product, uniqueProducts.length);

        if (seenProductIds.has(productId)) continue;

        seenProductIds.add(productId);
        uniqueProducts.push({
          ...product,
          id: productId,
          category: product.category || step.category || "",
          usage: product.usage || step.instruction || "",
          reason:
            product.reason ||
            `Selected for the ${step.category || "skincare"} step according to the analysis.`,
        });
      }
    }

    let products = normalizeProducts(uniqueProducts);
    products = await attachAutomaticProductImages(products);

    const productSources = products
      .filter((product) => Boolean(product.buyUrl))
      .map((product) => ({
        title: `${product.brand} ${product.name}`.trim(),
        url: product.buyUrl,
      }));

    const routineStepToText = (step) => {
      if (typeof step === "string") return step;

      const productName = step?.product?.name
        ? ` — ${step.product.name}`
        : "";
      const instruction = step?.instruction
        ? `: ${step.instruction}`
        : "";

      return `${step?.category || step?.name || "Skincare step"}${productName}${instruction}`;
    };

    const morningRoutine = (finalRoutine.morning || []).map(routineStepToText);
    const nightRoutine = (finalRoutine.night || []).map(routineStepToText);
    const weeklyRoutine = (finalRoutine.weekly || []).map(routineStepToText);

    const routineTotal = products.reduce(
      (total, product) => total + (Number(product.price) || 0),
      0
    );

    const detectedBudget = budgetResult.budget.detectedBudget;
    const budgetStatus = budgetResult.budget.status;
    const productSearchUnavailable = products.length === 0;

    const productSearchMessage = productSearchUnavailable
      ? "No suitable products remained after routine, safety and budget processing."
      : "Products were selected from the verified local catalogue, checked by the safety and budget engines, and enriched with product-page images when available.";

    const priceDisclaimer =
      "Purchase links and catalogue prices may change on the seller's website. Patch-test new products before regular use.";

    const result = {
      ...skinAnalysis,

      // Keep the existing frontend field names.
      morningRoutine,
      nightRoutine,
      weeklyRoutine,
      products,
      routineTotal,
      detectedBudget,
      budgetStatus,
      priceDisclaimer,
      productSources,
      productSearchUnavailable,
      productSearchMessage,

      // New structured output for future frontend sections.
      routine: finalRoutine,
      safety: safetyResult.safety,
      budget: budgetResult.budget,
      weather: weatherResult.weather,
      missingProductSteps: selectedResult.missingSteps || [],
      pipeline: {
        analysis: "completed",
        routineBuilder: "completed",
        productSelector: "completed",
        safetyEngine: "completed",
        budgetEngine: "completed",
        weatherEngine: "completed",
      },
    };

    console.log(
      `SkinSense pipeline completed: ${products.length} unique product(s), total ₹${routineTotal}.`
    );

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("SkinSense analysis pipeline error:", error);

    const errorMessage = getErrorMessage(error);

    if (isQuotaError(error) || Number(error?.status) === 429) {
      return res.status(429).json({
        success: false,
        message:
          "The Gemini API quota is currently exhausted. The skin analysis could not be completed. Please wait for the quota to reset or review the billing and rate limits for your Google AI project.",
      });
    }

    const status = Number(error?.status);

    return res
      .status(Number.isFinite(status) && status >= 400 ? status : 500)
      .json({
        success: false,
        message: errorMessage || "SkinSense analysis failed.",
      });
  }
};

module.exports = {
  analyzeSkin,
};
