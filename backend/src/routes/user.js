import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import SymptomCheck from '../models/SymptomCheck.js';

const router = express.Router();

/**
 * GET /api/user/me
 * Returns logged-in user's profile
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/user/history
 * Get Symptom Checker history for dashboard
 */
router.get('/history', auth, async (req, res) => {
  try {
    const history = await SymptomCheck.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving history' });
  }
});

/**
 * PUT /api/user/me
 * Update profile fields: location, language, etc.
 */
router.put('/me', auth, async (req, res) => {
  try {
    const allowed = ['location', 'language'];
    const update = {};

    allowed.forEach((field) => {
      if (req.body[field]) update[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      update,
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Could not update profile' });
  }
});

export default router;
