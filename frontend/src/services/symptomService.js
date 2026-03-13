// frontend/src/services/symptomService.js
import axios from "axios";

// Base API URL comes from your Vite environment variables (.env file)
// Example: VITE_API_URL=http://localhost:4000
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Call the backend symptom checker
 * @param {Object} data - { symptomsText, age, language, userId? }
 * @returns {Promise<Object>} - triage + recommendations + AI advice
 */
export async function checkSymptoms(data) {
  try {
    const response = await axios.post(`${API_URL}/api/symptoms/check`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error calling symptom check:", error.response?.data || error.message);
    throw error;
  }
}
