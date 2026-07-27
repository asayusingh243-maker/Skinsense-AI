const fs = require("fs");
const mime = require("mime-types");
const { GoogleGenAI } = require("@google/genai");

const ANALYSIS_MODEL =
  process.env.GEMINI_ANALYSIS_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

const skinAnalysisSchema = {
  type: "object",
  properties: {
    skinType: {
      type: "string",
      description:
        "Likely visible skin type such as oily, dry, combination, normal, or sensitive.",
    },
    skinTone: {
      type: "string",
      description:
        "General visible skin-tone description. Do not infer ethnicity.",
    },
    undertone: {
      type: "string",
      description:
        "Likely visible undertone such as warm, cool, neutral, or uncertain.",
    },
    skinScore: {
      type: "integer",
      description:
        "General cosmetic skin-wellness score from 0 to 100. This is not a medical score.",
    },
    skinAge: {
      type: "string",
      description:
        "A cautious cosmetic appearance range, or 'Unable to estimate reliably'.",
    },
    hydration: {
      type: "string",
      description:
        "Likely hydration level such as low, balanced, or high, with cautious wording.",
    },
    oiliness: {
      type: "string",
      description:
        "Likely oiliness level such as low, moderate, or high.",
    },
    sensitivity: {
      type: "string",
      description:
        "Likely sensitivity level such as low, moderate, or high.",
    },
    barrierCondition: {
      type: "string",
      description:
        "Likely cosmetic barrier condition such as healthy, mildly compromised, compromised, or uncertain.",
    },
    acne: {
      type: "string",
      description:
        "Visible acne-related concern and cosmetic severity, without diagnosing a condition.",
    },
    pigmentation: {
      type: "string",
      description:
        "Visible uneven-tone or pigmentation concern and cosmetic severity.",
    },
    pores: {
      type: "string",
      description:
        "Visible pore appearance and cosmetic severity.",
    },
    fineLines: {
      type: "string",
      description:
        "Visible fine-line concern and cosmetic severity.",
    },
    mainConcerns: {
      type: "array",
      items: { type: "string" },
      description:
        "Up to five prioritized cosmetic skin concerns.",
    },
    concernSeverity: {
      type: "object",
      properties: {
        acne: { type: "string" },
        pigmentation: { type: "string" },
        pores: { type: "string" },
        dehydration: { type: "string" },
        oiliness: { type: "string" },
        sensitivity: { type: "string" },
        fineLines: { type: "string" },
      },
      required: [
        "acne",
        "pigmentation",
        "pores",
        "dehydration",
        "oiliness",
        "sensitivity",
        "fineLines",
      ],
    },
    helpfulIngredients: {
      type: "array",
      items: { type: "string" },
      description:
        "Ingredient types that may suit the visible concerns and questionnaire.",
    },
    avoidIngredients: {
      type: "array",
      items: { type: "string" },
      description:
        "Ingredients or practices to avoid or introduce cautiously.",
    },
    lifestyleTips: {
      type: "array",
      items: { type: "string" },
      description:
        "Practical, non-medical lifestyle and skincare-habit tips.",
    },
    analysisNotes: {
      type: "array",
      items: { type: "string" },
      description:
        "Important uncertainty notes, image-quality limitations, and cautious observations.",
    },
    dermatologistAdvice: {
      type: "string",
      description:
        "When professional evaluation may be appropriate, without alarmist language.",
    },
  },
  required: [
    "skinType",
    "skinTone",
    "undertone",
    "skinScore",
    "skinAge",
    "hydration",
    "oiliness",
    "sensitivity",
    "barrierCondition",
    "acne",
    "pigmentation",
    "pores",
    "fineLines",
    "mainConcerns",
    "concernSeverity",
    "helpfulIngredients",
    "avoidIngredients",
    "lifestyleTips",
    "analysisNotes",
    "dermatologistAdvice",
  ],
};

function getResponseText(response) {
  if (typeof response?.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  const parts = response?.candidates?.[0]?.content?.parts || [];

  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
}

function parseGeminiJson(response, responseName = "Gemini analysis") {
  const responseText = getResponseText(response);

  if (!responseText) {
    throw new Error(`${responseName} returned an empty response.`);
  }

  const cleaned = responseText
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstObjectBracket = cleaned.indexOf("{");
    const lastObjectBracket = cleaned.lastIndexOf("}");

    if (
      firstObjectBracket !== -1 &&
      lastObjectBracket > firstObjectBracket
    ) {
      try {
        return JSON.parse(
          cleaned.slice(firstObjectBracket, lastObjectBracket + 1)
        );
      } catch {
        // Fall through to the final error.
      }
    }
  }

  console.error(
    `${responseName} returned invalid JSON:`,
    cleaned.slice(0, 3000)
  );

  throw new Error(`${responseName} returned invalid JSON.`);
}

function normalizeStringArray(value, maximumItems = 10) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maximumItems);
}

function clampScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeSkinAnalysis(rawAnalysis) {
  const severity = rawAnalysis?.concernSeverity || {};

  return {
    skinType: String(rawAnalysis?.skinType || "Uncertain").trim(),
    skinTone: String(rawAnalysis?.skinTone || "Uncertain").trim(),
    undertone: String(rawAnalysis?.undertone || "Uncertain").trim(),
    skinScore: clampScore(rawAnalysis?.skinScore),
    skinAge: String(
      rawAnalysis?.skinAge || "Unable to estimate reliably"
    ).trim(),
    hydration: String(rawAnalysis?.hydration || "Uncertain").trim(),
    oiliness: String(rawAnalysis?.oiliness || "Uncertain").trim(),
    sensitivity: String(rawAnalysis?.sensitivity || "Uncertain").trim(),
    barrierCondition: String(
      rawAnalysis?.barrierCondition || "Uncertain"
    ).trim(),
    acne: String(rawAnalysis?.acne || "No clear visible concern").trim(),
    pigmentation: String(
      rawAnalysis?.pigmentation || "No clear visible concern"
    ).trim(),
    pores: String(rawAnalysis?.pores || "No clear visible concern").trim(),
    fineLines: String(
      rawAnalysis?.fineLines || "No clear visible concern"
    ).trim(),
    mainConcerns: normalizeStringArray(rawAnalysis?.mainConcerns, 5),
    concernSeverity: {
      acne: String(severity.acne || "none").trim(),
      pigmentation: String(severity.pigmentation || "none").trim(),
      pores: String(severity.pores || "none").trim(),
      dehydration: String(severity.dehydration || "none").trim(),
      oiliness: String(severity.oiliness || "none").trim(),
      sensitivity: String(severity.sensitivity || "none").trim(),
      fineLines: String(severity.fineLines || "none").trim(),
    },
    helpfulIngredients: normalizeStringArray(
      rawAnalysis?.helpfulIngredients,
      10
    ),
    avoidIngredients: normalizeStringArray(
      rawAnalysis?.avoidIngredients,
      10
    ),
    lifestyleTips: normalizeStringArray(rawAnalysis?.lifestyleTips, 8),
    analysisNotes: normalizeStringArray(rawAnalysis?.analysisNotes, 8),
    dermatologistAdvice: String(
      rawAnalysis?.dermatologistAdvice ||
        "Consider a dermatologist if symptoms are painful, persistent, rapidly worsening, or causing significant concern."
    ).trim(),
  };
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
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

  return String(error || "Unknown error");
}

function getErrorStatus(error) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("status" in error) {
    const status = Number(error.status);

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
  const status = getErrorStatus(error);
  const message = getErrorMessage(error).toLowerCase();

  return (
    status === 429 ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
}

/**
 * Analyze a facial image with Gemini.
 *
 * @param {object} input
 * @param {string} input.imagePath Absolute path of the uploaded image.
 * @param {object} input.questionnaire User questionnaire data.
 * @returns {Promise<object>} Normalized cosmetic skin analysis.
 */
async function analyzeSkinImage({ imagePath, questionnaire }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing from the backend environment."
    );
  }

  if (!imagePath || typeof imagePath !== "string") {
    throw new Error("A valid image path is required for skin analysis.");
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error("Uploaded image was not found.");
  }

  if (!questionnaire || typeof questionnaire !== "object") {
    throw new Error("Questionnaire data is required.");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const imageBytes = fs.readFileSync(imagePath);
  const imageBase64 = imageBytes.toString("base64");
  const mimeType = mime.lookup(imagePath) || "image/jpeg";
  const environment = questionnaire.environment || null;

  const prompt = `
You are a cosmetic skincare analysis assistant.

Analyze the uploaded facial image together with the user's questionnaire.

Questionnaire:
${JSON.stringify(questionnaire, null, 2)}

Environmental context:
${JSON.stringify(environment, null, 2)}

Output rules:
- Return only one JSON object matching the supplied schema.
- Do not return Markdown or explanatory text outside the JSON.
- Provide cosmetic skincare guidance only.
- Do not diagnose diseases, medical conditions, or allergies.
- Do not identify the person or infer ethnicity, religion, health history, or other sensitive traits.
- Do not claim certainty from a photograph.
- Use cautious wording such as "appears", "may indicate", "possibly", "likely", or "uncertain".
- Use the questionnaire to assess reported sensitivity, lifestyle, hydration, oiliness, sun exposure, and existing routine.
- Treat environmental data only as supportive context.
- Humidity and temperature may influence hydration and product-texture guidance.
- UV index may influence sunscreen guidance.
- AQI and PM2.5 may influence general cleansing and barrier-support guidance.
- Do not claim that weather or pollution proves a medical condition.
- Keep skinScore between 0 and 100.
- skinScore is a general cosmetic wellness score, not a medical score.
- Prioritize no more than five main concerns.
- Use severity labels: none, mild, moderate, high, or uncertain.
- Do not recommend prescription medicines.
- Do not select product brands or specific products.
- helpfulIngredients should contain ingredient types only.
- avoidIngredients may include ingredients or practices that should be avoided or introduced slowly.
- Include clear uncertainty notes when lighting, blur, makeup, angle, or image quality limits the analysis.
- Recommend professional evaluation when there are painful, persistent, rapidly worsening, bleeding, infected-looking, or otherwise concerning symptoms.
`;

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
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
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: skinAnalysisSchema,
      },
    });

    const rawAnalysis = parseGeminiJson(response, "Skin analysis");
    return normalizeSkinAnalysis(rawAnalysis);
  } catch (error) {
    if (isQuotaError(error)) {
      const quotaError = new Error(
        "The Gemini API quota is currently exhausted. Please wait for the quota to reset or review your Google AI billing and rate limits."
      );
      quotaError.status = 429;
      throw quotaError;
    }

    const serviceError = new Error(
      getErrorMessage(error) || "Gemini skin analysis failed."
    );
    serviceError.status = getErrorStatus(error) || 500;
    throw serviceError;
  }
}

module.exports = {
  analyzeSkinImage,
  skinAnalysisSchema,
  normalizeSkinAnalysis,
  isQuotaError,
  getErrorMessage,
};
