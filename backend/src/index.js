import dotenv from 'dotenv';
dotenv.config();

console.log("Loaded GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "✔️ present" : "❌ missing");

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';


import authRoutes from './routes/auth.js';
import symptomRoutes from './routes/symptoms.js';
import clinicRoutes from './routes/clinics.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';


const app = express();
app.use(cors({
  origin: "*"
}));

app.use(cors());
app.use(express.json());

// health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);


// connect to MongoDB then start server
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
