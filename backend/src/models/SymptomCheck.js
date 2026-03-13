import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symptomsText: String,
  normalized: [String],
  triageLevel: Number,
  triageLabel: String,
  advice: String,
  recommendations: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SymptomCheck', schema);
