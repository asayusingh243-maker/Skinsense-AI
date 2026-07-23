const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const FALLBACK_PRODUCT_IMAGE =
  "/products/product-placeholder.png";

/* -------------------------------------------------------------------------- */
/*                         Skin analysis response schema                       */
/* -------------------------------------------------------------------------- */

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
  ],
};

/* -------------------------------------------------------------------------- */
/*                      Product recommendation response schema                */
/* -------------------------------------------------------------------------- */

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
        "Whether the complete recommended routine is within the user's budget.",
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
            description:
              "For example: cleanser, moisturizer, sunscreen, serum or treatment.",
          },

          size: {
            type: "string",
            description:
              "Product size such as 50 ml. Use an empty string when unavailable.",
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
              "Direct URL of the selected product page.",
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
              "Direct image URL for the exact recommended product. Use an empty string when unavailable.",
          },

          reason: {
            type: "string",
            description:
              "Personalized explanation based on skin type, concerns, sensitivity, lifestyle and budget.",
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
            description:
              "Date or date-time when the price was checked.",
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
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      `${responseName} returned invalid JSON:`,
      responseText
    );

    throw new Error(
      `${responseName} returned invalid JSON.`
    );
  }
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

function createProductId(product, index) {
  if (
    typeof product.id === "string" &&
    product.id.trim()
  ) {
    return product.id.trim();
  }

  const value = `${product.brand || "product"}-${
    product.name || index + 1
  }`;

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
      const normalizedValue = value.replace(/,/g, "");

      const matches =
        normalizedValue.match(/\d+(?:\.\d+)?/g);

      if (matches?.length) {
        const amounts = matches
          .map(Number)
          .filter(
            (amount) =>
              Number.isFinite(amount) && amount > 0
          );

        if (amounts.length > 0) {
          // For ₹500–₹1000, use ₹1000 as the total limit.
          return Math.round(Math.max(...amounts));
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

      return {
        id: createProductId(product, index),

        brand:
          typeof product.brand === "string"
            ? product.brand.trim()
            : "",

        name:
          typeof product.name === "string"
            ? product.name.trim()
            : "",

        category:
          typeof product.category === "string"
            ? product.category.trim()
            : "",

        size:
          typeof product.size === "string"
            ? product.size.trim()
            : "",

        price:
          Number.isFinite(price) && price > 0
            ? Math.round(price)
            : 0,

        originalPrice:
          Number.isFinite(originalPrice) &&
          originalPrice > 0
            ? Math.round(originalPrice)
            : 0,

        currency: "INR",

        seller:
          typeof product.seller === "string"
            ? product.seller.trim()
            : "",

        buyUrl: safeHttpUrl(
          product.buyUrl
        ),

        alternativeSeller:
          typeof product.alternativeSeller ===
          "string"
            ? product.alternativeSeller.trim()
            : "",

        alternativeBuyUrl: safeHttpUrl(
          product.alternativeBuyUrl
        ),

        imageUrl:
          safeHttpUrl(product.imageUrl) ||
          FALLBACK_PRODUCT_IMAGE,

        reason:
          typeof product.reason === "string" &&
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
          typeof product.usage === "string"
            ? product.usage.trim()
            : "",

        warnings:
          normalizeStringArray(
            product.warnings
          ).length > 0
            ? normalizeStringArray(
                product.warnings
              )
            : [
                "Patch-test before regular use.",
              ],

        priceCheckedAt:
          typeof product.priceCheckedAt ===
          "string"
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

function extractSearchSources(response) {
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
          item.urlRetrievalStatus || "",
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
    const code = Number(
      error.code
    );

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

const analyzeSkin = async (
  req,
  res
) => {
  try {
    const {
      questionnaire,
      image,
    } = req.body;

    if (!questionnaire) {
      return res.status(400).json({
        success: false,
        message:
          "Questionnaire data is required.",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message:
          "Image is required.",
      });
    }

    const safeImageName =
      path.basename(image);

    const imagePath = path.join(
      __dirname,
      "../uploads",
      safeImageName
    );

    if (
      !fs.existsSync(imagePath)
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Uploaded image was not found.",
      });
    }

    const imageBytes =
      fs.readFileSync(imagePath);

    const imageBase64 =
      imageBytes.toString("base64");

    const mimeType =
      mime.lookup(imagePath) ||
      "image/jpeg";

    /* ---------------------------------------------------------------------- */
    /*                    Stage 1: Analyze the uploaded image                  */
    /* ---------------------------------------------------------------------- */

    const skinAnalysisPrompt = `
You are a skincare analysis assistant.

Analyze the uploaded facial image together with the user's questionnaire.

Questionnaire:

${JSON.stringify(
  questionnaire,
  null,
  2
)}

Important rules:

- Provide cosmetic skincare guidance only.
- Do not diagnose medical conditions or skin diseases.
- Do not claim certainty from a photograph.
- Use careful wording such as "appears", "may indicate", "possibly" or "likely".
- Consider the questionnaire when evaluating hydration, oiliness, sensitivity, lifestyle and current routine.
- Generate a practical morning routine and night routine.
- Keep the skin score between 0 and 100.
- The skin score is a general cosmetic wellness score, not a medical score.
- Do not recommend particular product brands during this stage.
- Recommend potentially helpful ingredient types.
- Include ingredients or skincare practices the user may need to avoid.
- Keep all recommendations suitable for the user's stated sensitivity.
`;

    const analysisResponse =
      await ai.models.generateContent({
        model: MODEL,

        contents: [
          {
            role: "user",

            parts: [
              {
                inlineData: {
                  mimeType,
                  data: imageBase64,
                },
              },

              {
                text:
                  skinAnalysisPrompt,
              },
            ],
          },
        ],

        config: {
          responseMimeType:
            "application/json",

          responseSchema:
            skinAnalysisSchema,
        },
      });

    const skinAnalysis =
      parseGeminiJson(
        analysisResponse,
        "Skin analysis"
      );

    /* ---------------------------------------------------------------------- */
    /*                       Stage 2: Search live products                     */
    /* ---------------------------------------------------------------------- */

    const questionnaireBudget =
      extractBudget(
        questionnaire
      );

    const productSearchPrompt = `
Find current skincare products sold in India that fit this user's skin analysis, skincare needs and total budget.

Skin analysis:

${JSON.stringify(
  skinAnalysis,
  null,
  2
)}

Questionnaire:

${JSON.stringify(
  questionnaire,
  null,
  2
)}

Detected numeric budget:

${
  questionnaireBudget > 0
    ? `₹${questionnaireBudget}`
    : "No clear numeric budget was provided."
}

Search and recommendation rules:

- Search current public product pages.
- Do not hardcode or favor any brand.
- Compare suitable options from different brands.
- Recommend between 2 and 4 products.
- Recommend only products that can be identified from public pages.
- Prefer official brand websites and established Indian beauty or skincare retailers.
- Use marketplace listings only when the exact product and seller appear trustworthy.
- The buyUrl must point directly to the product page.
- Do not use a homepage or search-results URL as the buyUrl.
- Do not invent product names, prices, sizes, ingredients, sellers or URLs.
- If the current price cannot be confirmed, return 0 for price.
- Return all prices in INR.
- Treat the budget as the total budget for the complete routine.
- Do not treat the budget as the maximum price for every individual product.
- Keep the combined total within the user's budget whenever a budget is provided.
- For limited budgets, prioritize cleanser, moisturizer and sunscreen.
- Add a serum or treatment only when the budget allows.
- Do not recommend duplicate products.
- Avoid unnecessarily repeating the same active ingredient.
- Do not recommend prescription medicines.
- Explain why every product matches the user's skin type, concerns, sensitivity, lifestyle and budget.
- Include a reliable product image URL only when it matches the exact product.
- Return an empty imageUrl when a reliable image cannot be verified.
- Include usage guidance.
- Include patch-test and irritation warnings where relevant.
- Mention that prices and availability can change.
`;

    let productResult = {
      detectedBudget:
        questionnaireBudget,

      budgetStatus:
        "Live product search unavailable",

      products: [],

      priceDisclaimer:
        "Live product prices and availability could not be checked.",
    };

    let productSources = [];

    let productSearchUnavailable =
      false;

    let productSearchMessage = "";

    try {
      const productResponse =
        await ai.models.generateContent({
          model: MODEL,

          contents:
            productSearchPrompt,

          config: {
            tools: [
              {
                googleSearch: {},
              },

              {
                urlContext: {},
              },
            ],

            responseMimeType:
              "application/json",

            responseSchema:
              productRecommendationSchema,
          },
        });

      productResult =
        parseGeminiJson(
          productResponse,
          "Product search"
        );

      productSources =
        extractSearchSources(
          productResponse
        );
    } catch (productError) {
      console.error(
        "Live product search error:",
        productError
      );

      productSearchUnavailable =
        true;

      if (
        isQuotaError(
          productError
        )
      ) {
        productSearchMessage =
          "Your skin analysis was completed, but live product search is temporarily unavailable because the Gemini API quota was exhausted. Please try product search again after the quota resets.";

        productResult = {
          detectedBudget:
            questionnaireBudget,

          budgetStatus:
            "Live product search unavailable",

          products: [],

          priceDisclaimer:
            "Live prices, sellers and product availability could not be verified because the Gemini product-search quota was exhausted.",
        };
      } else {
        productSearchMessage =
          "Your skin analysis was completed, but live products, prices and sellers could not be verified at this time.";

        productResult = {
          detectedBudget:
            questionnaireBudget,

          budgetStatus:
            "Live product search unavailable",

          products: [],

          priceDisclaimer:
            "Live prices, sellers and product availability could not be verified because the product search failed.",
        };
      }
    }

    const products =
      normalizeProducts(
        productResult.products
      );

    const calculatedRoutineTotal =
      products.reduce(
        (total, product) =>
          total + product.price,
        0
      );

    const detectedBudget =
      questionnaireBudget ||
      Number(
        productResult.detectedBudget
      ) ||
      0;

    let budgetStatus =
      productResult.budgetStatus ||
      "Budget not provided";

    if (
      !productSearchUnavailable &&
      detectedBudget > 0
    ) {
      budgetStatus =
        calculatedRoutineTotal <=
        detectedBudget
          ? "Within budget"
          : "Above budget";
    }

    const result = {
      ...skinAnalysis,

      products,

      routineTotal:
        calculatedRoutineTotal,

      detectedBudget,

      budgetStatus,

      priceDisclaimer:
        productResult
          .priceDisclaimer ||
        "Prices and availability were checked during analysis and may change before purchase.",

      productSources,

      productSearchUnavailable,

      productSearchMessage,
    };

    console.log(
      productSearchUnavailable
        ? "Skin analysis completed. Live product search was unavailable."
        : "Skin analysis and live product search completed successfully."
    );

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Gemini analysis error:",
      error
    );

    const errorMessage =
      getErrorMessage(error);

    if (isQuotaError(error)) {
      return res.status(429).json({
        success: false,

        message:
          "The Gemini API quota is currently exhausted. Your skin analysis could not be completed. Please wait for the quota to reset or review the billing and rate limits for your Google AI project.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        errorMessage ||
        "Gemini analysis failed.",
    });
  }
};

module.exports = {
  analyzeSkin,
};