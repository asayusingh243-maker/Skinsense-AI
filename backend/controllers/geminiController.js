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
          "brand",
          "name",
          "category",
          "price",
          "currency",
          "reason",
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



const productPageLookupSchema = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          productPageUrl: {
            type: "string",
            description:
              "Direct official-brand or trusted Indian retailer page for the exact product. Return an empty string when no exact page is found.",
          },
          seller: {
            type: "string",
            description:
              "Brand or retailer name for the returned product page.",
          },
        },
        required: ["id", "productPageUrl", "seller"],
      },
    },
  },
  required: ["products"],
};
const productEnrichmentSchema = {
  type: "object",

  properties: {
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

          seller: {
            type: "string",
          },

          buyUrl: {
            type: "string",
            description:
              "Direct public page for the exact product. Return an empty string if it cannot be verified.",
          },

          imageUrl: {
            type: "string",
            description:
              "Direct public image URL for the exact product. Return an empty string if it cannot be verified.",
          },
        },

        required: [
          "id",
          "brand",
          "name",
          "seller",
          "buyUrl",
          "imageUrl",
        ],
      },
    },
  },

  required: ["products"],
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

  /*
    First try parsing the complete response.
  */
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue and try extracting the JSON object.
  }

  /*
    Gemini may occasionally add explanatory text before
    or after the JSON. Extract the outermost JSON object.
  */
  const firstObjectBracket = cleaned.indexOf("{");
  const lastObjectBracket = cleaned.lastIndexOf("}");

  if (
    firstObjectBracket !== -1 &&
    lastObjectBracket > firstObjectBracket
  ) {
    const possibleObject = cleaned.slice(
      firstObjectBracket,
      lastObjectBracket + 1
    );

    try {
      return JSON.parse(possibleObject);
    } catch {
      // Continue to the final error.
    }
  }

  /*
    Also support a top-level JSON array if one is ever returned.
  */
  const firstArrayBracket = cleaned.indexOf("[");
  const lastArrayBracket = cleaned.lastIndexOf("]");

  if (
    firstArrayBracket !== -1 &&
    lastArrayBracket > firstArrayBracket
  ) {
    const possibleArray = cleaned.slice(
      firstArrayBracket,
      lastArrayBracket + 1
    );

    try {
      return JSON.parse(possibleArray);
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

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
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



function safePublicProductUrl(value) {
  const safeUrl = safeHttpUrl(value);

  if (!safeUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(safeUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    const isPrivateHost =
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

    return isPrivateHost ? "" : parsedUrl.toString();
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

function extractMetaContent(html, attributeName, attributeValue) {
  const escapedName = attributeName.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const escapedValue = attributeValue.replace(
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
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return "";
}

async function fetchProductPageImage(productPageUrl) {
  const safePageUrl = safePublicProductUrl(productPageUrl);

  if (!safePageUrl) {
    return "";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(safePageUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return "";
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("text/html")) {
      return "";
    }

    const html = await response.text();

    const rawImageUrl =
      extractMetaContent(html, "property", "og:image:secure_url") ||
      extractMetaContent(html, "property", "og:image") ||
      extractMetaContent(html, "name", "twitter:image") ||
      extractMetaContent(html, "name", "twitter:image:src");

    if (!rawImageUrl) {
      return "";
    }

    try {
      return safeHttpUrl(
        new URL(rawImageUrl, response.url || safePageUrl).toString()
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

async function findExactProductPages(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const lookupItems = products.map((product) => ({
    id: product.id,
    brand: product.brand,
    name: product.name,
    size: product.size || "",
  }));

  const prompt = `
Search for the exact public product page for every skincare product below.

Products:
${JSON.stringify(lookupItems, null, 2)}

Rules:
- Return one record for every supplied id.
- Prefer the official brand website.
- Otherwise use a trusted Indian retailer such as Nykaa, Tira, Purplle, Amazon India only when the exact product and seller are clear.
- The productPageUrl must be a direct page for the exact named product, not a homepage or search-results page.
- Match the brand, full product name and size whenever possible.
- Do not invent URLs.
- Return an empty productPageUrl and seller when no exact page can be verified.
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      tools: [
        { googleSearch: {} },
        { urlContext: {} },
      ],
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: productPageLookupSchema,
        },
      },
    },
  });

  const result = parseGeminiJson(
    response,
    "Product page lookup"
  );

  return Array.isArray(result.products)
    ? result.products
    : [];
}

async function enrichProductsWithImages(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return products;
  }

  const needsLookup = products.filter(
    (product) =>
      !safePublicProductUrl(product.buyUrl) ||
      !safeHttpUrl(product.imageUrl) ||
      product.imageUrl === FALLBACK_PRODUCT_IMAGE
  );

  let lookupResults = [];

  if (needsLookup.length > 0) {
    try {
      lookupResults = await findExactProductPages(needsLookup);
    } catch (error) {
      console.error(
        "Product page lookup error:",
        getErrorMessage(error)
      );
    }
  }

  const lookupById = new Map(
    lookupResults.map((item) => [String(item.id || ""), item])
  );

  return Promise.all(
    products.map(async (product) => {
      const lookup = lookupById.get(product.id) || {};

      const productPageUrl =
        safePublicProductUrl(product.buyUrl) ||
        safePublicProductUrl(lookup.productPageUrl);

      const currentImageUrl =
        product.imageUrl !== FALLBACK_PRODUCT_IMAGE
          ? safeHttpUrl(product.imageUrl)
          : "";

      const fetchedImageUrl = currentImageUrl
        ? ""
        : await fetchProductPageImage(productPageUrl);

      const verifiedSeller =
        typeof lookup.seller === "string"
          ? lookup.seller.trim()
          : "";

      return {
        ...product,
        buyUrl: productPageUrl || product.buyUrl,
        seller:
          product.seller &&
          product.seller !== "Check official retailer"
            ? product.seller
            : verifiedSeller || product.seller,
        imageUrl:
          currentImageUrl ||
          fetchedImageUrl ||
          FALLBACK_PRODUCT_IMAGE,
      };
    })
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
async function enrichProductsWithSearch(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      products: [],
      sources: [],
    };
  }

  const productsToFind = products.map((product) => ({
    id: product.id,
    brand: product.brand,
    name: product.name,
  }));

  const enrichmentPrompt = `
Search for the exact skincare products listed below.

Products:

${JSON.stringify(productsToFind, null, 2)}

For every product:

- Keep the same id, brand and product name.
- Search for the exact product sold in India.
- Prefer the official brand website.
- If the official website is unavailable, use a trusted Indian retailer.
- The buyUrl must be a direct product-detail page.
- Do not return a homepage, category page or search-results page.
- The imageUrl must be a direct publicly accessible image of the exact product.
- Prefer the product page's main image, og:image or twitter:image.
- Do not use a logo, banner, unrelated image or generic category image.
- Do not invent URLs.
- Return an empty string if the product page or image cannot be verified.
- Return one result for every supplied product.
`;

  const response = await ai.models.generateContent({
    model: MODEL,

    contents: enrichmentPrompt,

    config: {
      tools: [
        {
          googleSearch: {},
        },
        {
          urlContext: {},
        },
      ],

      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: productEnrichmentSchema,
        },
      },
    },
  });

  const enrichmentResult = parseGeminiJson(
    response,
    "Product image and link enrichment"
  );

  const enrichedProducts = Array.isArray(
    enrichmentResult.products
  )
    ? enrichmentResult.products
    : [];

  const enrichedById = new Map(
    enrichedProducts.map((product) => [
      String(product.id || "").trim(),
      product,
    ])
  );

  const mergedProducts = products.map((product) => {
    let enrichedProduct = enrichedById.get(product.id);

    /*
      If Gemini changes or omits the id, try matching
      using brand and product name.
    */
    if (!enrichedProduct) {
      enrichedProduct = enrichedProducts.find((candidate) => {
        const candidateBrand = String(
          candidate.brand || ""
        )
          .trim()
          .toLowerCase();

        const candidateName = String(
          candidate.name || ""
        )
          .trim()
          .toLowerCase();

        return (
          candidateBrand ===
            product.brand.trim().toLowerCase() &&
          candidateName ===
            product.name.trim().toLowerCase()
        );
      });
    }

    if (!enrichedProduct) {
      return product;
    }

    const verifiedBuyUrl = safeHttpUrl(
      enrichedProduct.buyUrl
    );

    const verifiedImageUrl = safeHttpUrl(
      enrichedProduct.imageUrl
    );

    const verifiedSeller =
      typeof enrichedProduct.seller === "string"
        ? enrichedProduct.seller.trim()
        : "";

    return {
      ...product,

      seller:
        verifiedSeller ||
        product.seller ||
        "Check official retailer",

      buyUrl:
        verifiedBuyUrl ||
        product.buyUrl ||
        "",

      imageUrl:
        verifiedImageUrl ||
        product.imageUrl ||
        FALLBACK_PRODUCT_IMAGE,
    };
  });

  return {
    products: mergedProducts,
    sources: extractSearchSources(response),
  };
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
          responseMimeType: "application/json",
          responseSchema: skinAnalysisSchema,
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
            ],

            responseFormat: {
              text: {
                mimeType: "application/json",
                schema: productRecommendationSchema,
              },
            },
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

      console.log(
        "Gemini product search returned:",
        Array.isArray(productResult.products)
          ? `${productResult.products.length} product(s)`
          : "no products array"
      );
    } catch (productError) {
      console.error(
        "Live product search error:",
        getErrorMessage(productError)
      );

      productSearchUnavailable =
        true;

      if (
        isQuotaError(
          productError
        )
      ) {
        productSearchMessage =
          "Live product verification is temporarily unavailable because the Gemini API quota was exhausted. AI-generated product suggestions are shown below; verify prices and availability before purchase.";
      } else {
        productSearchMessage =
          "Live product verification is temporarily unavailable. AI-generated product suggestions are shown below; verify prices and availability before purchase.";
      }
    }

    let products =
      normalizeProducts(
        productResult.products
      );

    /*
      If the grounded search fails or returns no usable products,
      ask Gemini for dynamic, non-hardcoded suggestions without
      live-search claims. This keeps the product section useful
      while clearly marking prices and links as unverified.
    */
    if (products.length === 0) {
      try {
        const fallbackPrompt = `
Create a personalized skincare product routine for this user.

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

Total budget:
${
  questionnaireBudget > 0
    ? `₹${questionnaireBudget}`
    : "Not clearly provided"
}

Rules:
- Recommend 2 to 4 real, commonly available skincare products in India.
- Choose products dynamically from different suitable brands.
- Keep the complete routine within the total budget when one is provided.
- Prioritize cleanser, moisturizer and sunscreen for a limited budget.
- Do not recommend prescription medicines.
- Use cautious cosmetic guidance only.
- Prices may be approximate; use a realistic INR estimate.
- Leave buyUrl, alternativeBuyUrl and imageUrl empty when they are not verified. A separate grounded lookup will try to add the exact product page and product image.
- Set seller to "Check official retailer".
- Explain why each product suits the user's visible skin needs and questionnaire answers.
- Include usage guidance and patch-test warnings.
`;

        const fallbackResponse =
          await ai.models.generateContent({
            model: MODEL,
            contents: fallbackPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: productRecommendationSchema,
            },
          });

        const fallbackResult =
          parseGeminiJson(
            fallbackResponse,
            "AI product fallback"
          );

        products =
          normalizeProducts(
            fallbackResult.products
          );

        if (products.length > 0) {
          productResult = {
            ...fallbackResult,
            detectedBudget:
              questionnaireBudget ||
              Number(
                fallbackResult.detectedBudget
              ) ||
              0,
            budgetStatus:
              "AI suggestions — verify current prices",
            priceDisclaimer:
              "These products were selected dynamically by AI, but live prices, sellers and purchase links were not verified. Check an official retailer before buying.",
          };

          productSearchUnavailable =
            true;

          if (!productSearchMessage) {
            productSearchMessage =
              "Live product verification returned no usable products, so AI-generated suggestions are shown instead.";
          }
        }
      } catch (fallbackError) {
        console.error(
          "AI product fallback error:",
          getErrorMessage(
            fallbackError
          )
        );

        productSearchUnavailable =
          true;

        if (!productSearchMessage) {
          productSearchMessage =
            "Products could not be generated at this time. Please try again later.";
        }
      }
    }



    products = await enrichProductsWithImages(products);
    /*
  Stage 3: Enrich AI-selected products with
  verified purchase pages and product images.
*/
const needsProductEnrichment = products.some(
  (product) =>
    !product.buyUrl ||
    !product.imageUrl ||
    product.imageUrl === FALLBACK_PRODUCT_IMAGE
);

if (
  products.length > 0 &&
  needsProductEnrichment
) {
  try {
    console.log(
      "Searching for product images and purchase links..."
    );

    const enrichment =
      await enrichProductsWithSearch(products);

    if (
      Array.isArray(enrichment.products) &&
      enrichment.products.length > 0
    ) {
      products = enrichment.products;
    }

    /*
      Merge and remove duplicate search sources.
    */
    const combinedSources = [
      ...productSources,
      ...(Array.isArray(enrichment.sources)
        ? enrichment.sources
        : []),
    ];

    const seenSourceUrls = new Set();

    productSources = combinedSources
      .filter((source) => {
        const sourceUrl =
          typeof source?.url === "string"
            ? source.url.trim()
            : "";

        if (
          !sourceUrl ||
          seenSourceUrls.has(sourceUrl)
        ) {
          return false;
        }

        seenSourceUrls.add(sourceUrl);
        return true;
      })
      .slice(0, 15);

    const productsWithImages =
      products.filter(
        (product) =>
          product.imageUrl &&
          product.imageUrl !==
            FALLBACK_PRODUCT_IMAGE
      ).length;

    const productsWithLinks =
      products.filter(
        (product) => Boolean(product.buyUrl)
      ).length;

    console.log(
      `Product enrichment completed: ${productsWithImages}/${products.length} image(s), ${productsWithLinks}/${products.length} purchase link(s).`
    );
  } catch (enrichmentError) {
    /*
      Do not fail the entire analysis if product
      image or link lookup fails.
    */
    console.error(
      "Product enrichment error:",
      getErrorMessage(enrichmentError)
    );

    productSearchUnavailable = true;

    if (!productSearchMessage) {
      productSearchMessage =
        "Products were generated, but some product images or purchase links could not be verified.";
    }
  }
}

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
