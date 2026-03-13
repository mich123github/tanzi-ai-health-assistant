import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  triageLabel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  advice: { type: String, default: '' },
  normalized: [{ type: String }], // array of symptom names
});

export default mongoose.model('History', HistorySchema);
