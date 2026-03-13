// Location: backend/src/services/translateService.js

import pkg from '@google-cloud/translate';

const { Translate } = pkg.v2; // v2 is the correct API for Node.js

const translator = new Translate({
  key: process.env.GOOGLE_API_KEY,
});

export async function translateText(text, targetLang) {
  try {
    const [translation] = await translator.translate(text, targetLang);
    return translation;
  } catch (err) {
    console.error("❌ Translation failed:", err);
    return text; // Fallback to original text
  }
}
