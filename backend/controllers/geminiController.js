const { GoogleGenAI } = require("@google/genai");
console.log("Gemini Key:", process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeSkin = async (req, res) => {
  try {
    const { questionnaire } = req.body;

    const prompt = `
You are an expert dermatologist.

Analyze the user's skin based on the questionnaire below.

Questionnaire:
${JSON.stringify(questionnaire, null, 2)}

Return ONLY valid JSON in this exact format:

{
  "skinType":"",
  "skinTone":"",
  "undertone":"",
  "skinScore":0,
  "acne":"",
  "pigmentation":"",
  "pores":"",
  "hydration":"",
  "morningRoutine":[],
  "nightRoutine":[],
  "products":[],
  "foods":[]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

   const cleaned = response.text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const result = JSON.parse(cleaned);

res.status(200).json({
  success: true,
  result,
});

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  analyzeSkin,
};