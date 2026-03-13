// backend/src/services/llmAdapter.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Use a supported Gemini 2.0 model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export async function analyzeSymptoms(symptomsText, age, language = "en", systemInstruction = "") {
  try {

    if (!systemInstruction) {
      systemInstruction =
        language === "ny"
          ? `You are a supportive Malawian health assistant. Reply ONLY in Chichewa. Keep replies short.`
          : `You are a health assistant. Reply ONLY in English. Keep replies short.`;
    }

    const prompt = `
${systemInstruction}

A ${age}-year-old reports: ${symptomsText}.

Provide ONLY:
1) 2-3 possible causes in simple words.
2) 3 short home-care tips.
3) 3 red flags needing urgent care.
Use easy language.
`;

    const result = await model.generateContent(prompt);

    const textResponse = result.response.text() || "No response received";

    const trimmed = textResponse.length > 500
      ? textResponse.slice(0, 500) + "..."
      : textResponse;

    return {
      adviceText: trimmed,
      redFlags: [
        "Difficulty breathing",
        "High fever",
        "Symptoms getting worse quickly"
      ],
    };

  } catch (error) {
    console.error("Gemini error:", error);
    return {
      adviceText: "AI advice unavailable — please consult a health professional.",
      redFlags: [],
    };
  }
}
