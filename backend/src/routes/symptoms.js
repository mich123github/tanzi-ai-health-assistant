import express from "express";
import { normalizeSymptoms, triage } from "../services/triage.js";
import { analyzeSymptoms } from "../services/llmAdapter.js";
import SymptomCheck from "../models/SymptomCheck.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 🔄 Default recommendations dictionary
const DEFAULT_RECOMMENDATIONS = {
  en: [
    "Monitor symptoms for 48 hours.",
    "Drink plenty of fluids and rest.",
    "Visit a clinic if symptoms worsen."
  ],
  ny: [
    "Yang'anirani zizindikiro kwa maola 48.",
    "Mamwe madzi ambiri ndipo mupume.",
    "Pitani kuchipatala ngati zizindikiro zikuwonjezeka."
  ]
};

// 🧾 Section labels dictionary
const SECTION_LABELS = {
  en: {
    causes: "Possible Causes",
    homeCare: "Home Care Tips",
    redFlags: "Red Flags (See a doctor FAST)"
  },
  ny: {
    causes: "Zifukwa Zotheka",
    homeCare: "Malangizo a Pakhomo",
    redFlags: "Zizindikiro Zowopsa (Pitani kuchipatala mwamsanga)"
  }
};

// Save a symptom check to DB
router.post("/save", auth, async (req, res) => {
  try {
    const { symptomsText, normalized, triageLevel, triageLabel, advice, recommendations } = req.body;
    if (!symptomsText || !triageLabel) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const savedCheck = await SymptomCheck.create({
      userId: req.userId,
      symptomsText,
      normalized,
      triageLevel,
      triageLabel,
      advice,
      recommendations
    });
    res.json({ message: "Symptom check saved", data: savedCheck });
  } catch (err) {
    console.error("❌ Failed to save symptom check:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🧠 Protected endpoint: analyze and save symptoms
router.post("/check", auth, async (req, res) => {
  try {
    const { symptomsText, age, language } = req.body;
    const userId = req.userId; // ✅ token-decoded user ID

    // 1️⃣ Normalize and triage locally
    const normalized = normalizeSymptoms(symptomsText || "");
    const tri = triage(normalized, age);

    // 2️⃣ Default recommendations (language-aware)
    let recommendations = DEFAULT_RECOMMENDATIONS[language || "en"].slice();

    let llmResult = null;

    // 3️⃣ Strict system instruction for language control
    let systemInstruction = "";
    if (language === "ny") {
      systemInstruction = `
You are a supportive Malawian health assistant.
Reply ONLY in natural, everyday Chichewa.
Do not use English or any other language.
`;
    } else {
      systemInstruction = `
You are a health assistant.
Reply ONLY in English.
Do not use Chichewa or any other language.
`;
    }

    // 4️⃣ Try Gemini/LLM if allowed
    if (process.env.USE_LLM === "true") {
      try {
        llmResult = await analyzeSymptoms(symptomsText, age, language || "en", systemInstruction);
        if (llmResult?.adviceText) {
          recommendations.unshift(llmResult.adviceText);
        }
      } catch (err) {
        console.warn("⚠️ LLM call failed:", err.message);
      }
    }

    // 5️⃣ Save result ONLY if user is logged in
    const saved = await SymptomCheck.create({
      userId,
      symptomsText,
      normalized,
      triageLevel: tri.level,
      triageLabel: tri.label,
      advice: tri.advice,
      recommendations,
      languageUsed: language || "en"
    });

    // 6️⃣ Send response (labels translated if Chichewa selected)
    res.json({
      triageLevel: tri.level,
      triageLabel: tri.label,
      advice: tri.advice,
      normalized,
      recommendations,
      llm: llmResult
        ? {
            ...llmResult,
            labels: SECTION_LABELS[language || "en"]
          }
        : null,
      savedCheckId: saved._id
    });
  } catch (err) {
    console.error("❌ Server error in /symptoms/check:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
