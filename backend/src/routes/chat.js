import express from 'express'; 
import { analyzeSymptoms } from '../services/llmAdapter.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { translateText } from '../services/translateService.js';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Warm canned replies strictly in Chichewa unless English is chosen
const CANNED = {
  en: {
    greeting: "Hello, I’m Tanzi Chatbot. Tell me what’s on your mind.",
    fallback: "I’m not fully sure, but tell me more so I can understand better."
  },
  chy: {
    greeting: "Moni, ndine Tanzi Chatbot. Ndili pano kukuthandizani. Fotokozani zomwe mukumva.",
    fallback: "Pepani, sindamvetsa bwino. Mufotokoze pang’ono kuti ndimvetse bwino."
  }
};

// Emotion detector
function detectEmotion(text) {
  const t = text.toLowerCase();

  if (/sad|chisoni|cry|kulira/.test(t)) return "sad";
  if (/worried|nkhawa|anxiety|mantha/.test(t)) return "worried";
  if (/angry|kukwiya|frustrated/.test(t)) return "angry";
  if (/tired|fatigue|kutopa/.test(t)) return "tired";
  if (/pain|ululu|kupweteka/.test(t)) return "pain";

  return null;
}

// Small advice based on emotion
function quickAdvice(em, lang) {
  if (!em) return "";

  const tips = {
    sad: {
      en: "Try taking a slow breath. You’re not alone.",
      chy: "Yesetsani kupuma pang’onopang’ono. Simuli nokha."
    },
    worried: {
      en: "Slow breathing can help reduce anxiety.",
      chy: "Kupuma mozemba kungachepetse nkhawa."
    },
    angry: {
      en: "Taking a short pause may help.",
      chy: "Pumulani pang’ono kuti muthe kuziziritsa."
    },
    tired: {
      en: "Resting for a moment may help.",
      chy: "Yesani kupuma kaye, zingathandize."
    },
    pain: {
      en: "If the pain worsens, consider medical care.",
      chy: "Ngati ululu ukuwonjezeka, funafuna thandizo lachipatala."
    }
  };
  return tips[em]?.[lang] || "";
}

function formatReply(text, lang, emotion) {
  if (!text) return CANNED[lang]?.fallback;

  text = text.replace(/[*•]+/g, '').trim();

  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

  const advice = quickAdvice(emotion, lang);

  return advice ? `${sentences} ${advice}` : sentences;
}

router.post('/', async (req, res) => {
  let { message, language = 'chy', useLLM = false, useGemini = true } = req.body;

  if (!message) return res.status(400).json({ message: 'No message' });

  const userInput = message;
  const lower = userInput.toLowerCase().trim();
  const emotion = detectEmotion(userInput);

  // Greeting handler
  const GREETINGS = ["moni", "muli bwanji", "bwanji", "zabwino", "ndadzuka bwino"];

  if (GREETINGS.includes(lower)) {
    return res.json({
      reply: "Moni! Muli bwanji lero? Ndili pano ngati mungafune kulankhula."
    });
  }

  


  let aiInput = userInput;

  // Soft but strict conversation behavior
  let systemInstruction = "";

  if (language === "chy") {
    systemInstruction = `
You are mental Chatbot, a warm, supportive Malawian conversational assistant. Give reasonable, practical advice in friendly Chichewa. Be empathetic and understanding.

Reply ONLY in natural, everyday Chichewa.

Reply fully in natural conversational Chichewa. Just talk like a real person.
`;
  } else {
    systemInstruction = `
You are mental health Chatbot.
Respond in warm, supportive English.
Be conversational and emotionally aware. Give reasonable, practical advice. 
`;
  }

  let reply = "";
  try {
    if (useGemini) {
      // ✅ FIXED: replaced invalid "system" role with system_instruction

      const result = await geminiModel.generateContent({
         contents: [
    {
      role: "model",
      parts: [{ text: systemInstruction }]
    },
    {
      role: "user",
      parts: [{ text: aiInput }]
    }
  ]
      });

      reply = result.response.text();
    } else if (useLLM) {
      const llm = await analyzeSymptoms(aiInput, 30, language);
      reply = llm?.adviceText || CANNED[language].fallback;
    }
  } catch (err) {
    console.error("❌ AI error:", err);
    reply = CANNED[language]?.fallback;
  }

  reply = formatReply(reply, language, emotion);

  res.json({ reply });
});

export default router;
