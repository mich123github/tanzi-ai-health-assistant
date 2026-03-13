import express from 'express';
import History from '../models/History.js'; // ensure you have this model
import auth from '../middleware/auth.js'; // verifies logged-in user

const router = express.Router();

router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    const history = await History.find({ userId }).sort({ createdAt: 1 });

    // 🧠 SYMPTOM FREQUENCY BY DATE
    const trendData = {};
    history.forEach(entry => {
      const date = entry.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      entry.normalized.forEach(symptom => {
        if (!trendData[symptom]) trendData[symptom] = {};
        trendData[symptom][date] = (trendData[symptom][date] || 0) + 1;
      });
    });

    // ⚠️ TRIAGE SEVERITY BREAKDOWN
    const triageCounts = { low: 0, medium: 0, high: 0 };
    history.forEach(entry => {
      triageCounts[entry.triageLabel]++;
    });

    // 💡 INSIGHTS (basic version)
    const insights = [];
    if (triageCounts.high > 3) {
      insights.push("You've had 3+ high-urgency issues. Consider seeing a doctor.");
    }
    if (history.length > 10) {
      insights.push("Great job staying proactive! Continue tracking your symptoms.");
    }

    res.json({ trendData, triageCounts, insights });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch analytics." });
  }
});

export default router;
