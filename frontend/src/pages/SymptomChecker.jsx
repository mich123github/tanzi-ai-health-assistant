import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  // 🔄 Default language set to Chichewa
  const [language, setLanguage] = useState("ny");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  // 🔄 Translation dictionary
  const translations = {
    en: {
      header: "Symptom Checker",
      triage: "Triage",
      recommended: "Recommended Actions",
      redFlags: "Red Flags",
      normalized: "Normalized symptoms",
      ageLabel: "Your Age",
      symptomsLabel: "Describe Your Symptoms",
      languageLabel: "Language",
      placeholder: "e.g. fever, cough, chest pain",
      buttonCheck: "Check Symptoms",
      buttonAnalyzing: "Analyzing...",
      flags: ["Difficulty breathing", "High fever", "Symptoms getting worse quickly"],
    },
    ny: {
      header: "Woyang'anira Zizindikiro",
      triage: "Kuyerekezera",
      recommended: "Zochita Zolimbikitsidwa",
      redFlags: "Zizindikiro Zowopsa",
      normalized: "Zizindikiro zofanana",
      ageLabel: "Zaka Zanu",
      symptomsLabel: "Fotokozerani Zizindikiro Zanu",
      languageLabel: "Chiyankhulo",
      placeholder: "mwachitsanzo: malungo, chifuwa, kupweteka pachifuwa",
      buttonCheck: "Onani Zizindikiro",
      buttonAnalyzing: "Kusanthula...",
      flags: ["Kuvutika kupuma", "Malungo apamwamba", "Zizindikiro zikuwonjezeka mwachangu"],
    },
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/\*/g, "").replace(/\*\*/g, "").trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to check symptoms.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/symptoms/check",
        {
          symptomsText: symptoms,
          age: parseInt(age, 10),
          language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const translatedResult = {
        ...response.data,
        advice: cleanText(response.data.advice),
        recommendations: response.data.recommendations.map((rec) => cleanText(rec)),
        llm: response.data.llm
          ? {
              ...response.data.llm,
              redFlags: translations[language].flags,
            }
          : null,
      };
      setResult(translatedResult);

      await axios.post(
        "http://localhost:4000/api/symptoms/save",
        {
          symptomsText: symptoms,
          normalized: translatedResult.normalized,
          triageLevel: translatedResult.triageLevel,
          triageLabel: translatedResult.triageLabel,
          advice: translatedResult.advice,
          recommendations: translatedResult.recommendations,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch recommendations. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const triageColor = {
    1: "bg-green-100 text-green-700 border-green-300",
    2: "bg-yellow-100 text-yellow-700 border-yellow-300",
    3: "bg-orange-100 text-orange-700 border-orange-300",
    4: "bg-red-100 text-red-700 border-red-300",
    5: "bg-red-600 text-white border-red-700",
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-6 text-center">
        {translations[language].header}
      </h1>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Age */}
          <div>
            <label className="block font-semibold mb-1">
              {translations[language].ageLabel}
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border p-3 rounded-lg dark:bg-gray-900 dark:border-gray-600"
              required
            />
          </div>
          {/* Symptoms */}
          <div>
            <label className="block font-semibold mb-1">
              {translations[language].symptomsLabel}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full border p-3 rounded-lg min-h-[110px] dark:bg-gray-900 dark:border-gray-600"
              placeholder={translations[language].placeholder}
              required
            />
          </div>
          {/* Language */}
          <div>
            <label className="block font-semibold mb-1">
              {translations[language].languageLabel}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border p-3 rounded-lg dark:bg-gray-900 dark:border-gray-600"
            >
              <option value="en">English</option>
              <option value="ny">Chichewa</option>
            </select>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition"
            disabled={loading}
          >
            {loading
              ? translations[language].buttonAnalyzing
              : translations[language].buttonCheck}
          </button>
        </form>
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>

      {result && (
        <div ref={resultRef} className="mt-8 space-y-6 animate-fadeIn">
          {/* Triage Level */}
          <div
            className={`p-4 rounded-xl border ${triageColor[result.triageLevel]}`}
          >
            <h2 className="text-xl font-bold">
              {translations[language].triage}: {result.triageLabel} (Level {result.triageLevel})
            </h2>
            <p className="mt-1">{result.advice}</p>
          </div>
          {/* Recommendations */}
          {result.recommendations && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">{translations[language].recommended}</h3>
              <ul className="mt-2 space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-teal-600 font-bold mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Red Flags */}
          {result.llm?.redFlags?.length > 0 && (
            <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 rounded-lg">
              <h4 className="font-semibold">⚠️ {translations[language].redFlags}</h4>
              <ul className="list-disc list-inside mt-1">
                {result.llm.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Normalized */}
          {result.normalized && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {translations[language].normalized}:{" "}

              <span className="font-medium">{result.normalized.join(", ")}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
