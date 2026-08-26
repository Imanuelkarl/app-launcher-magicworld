import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import appsRouter from './routes/apps.js';
import authRouter from './routes/auth.js';
import App from './models/App.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();
const app = express();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { console.error('JWT_SECRET must be a random value of at least 32 characters.'); process.exit(1); }
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }), authRouter);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/apps', appsRouter);
app.use((error, _req, res, _next) => {
  res.status(400).json({ message: error.message || 'Something went wrong' });
});

const seedIfEmpty = async () => {
  if (await App.countDocuments()) return;
  await App.insertMany([
    { name: 'Pulse Analytics', description: 'Real-time business metrics and beautiful performance dashboards.', type: 'web', category: 'Analytics', platforms: ['Web'], isFeatured: true, isNew: true, webUrl: 'https://example.com', currentVersion: '2.3.1', latestVersion: '2.3.1', owner: 'Data Team' },
    { name: 'Studio Desk', description: 'A focused workspace for creative projects, reviews and approvals.', type: 'desktop', category: 'Productivity', platforms: ['Windows', 'macOS'], downloadUrl: 'https://example.com', currentVersion: '4.1.0', latestVersion: '4.2.0', owner: 'Creative Team' },
    { name: 'Field Connect', description: 'Keep field teams connected, informed and ready for every job.', type: 'mobile', category: 'Operations', platforms: ['iOS', 'Android'], downloadUrl: 'https://example.com', currentVersion: '1.8.2', latestVersion: '1.8.2', isNew: true, owner: 'Operations' }
  ]);
};

const seedDefaultAdmin = async () => {
  const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_NAME = 'MagicWorld Administrator' } = process.env;
  if (!DEFAULT_ADMIN_EMAIL && !DEFAULT_ADMIN_PASSWORD) return;
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD.length < 12) {
    console.warn('Default admin not created: set both DEFAULT_ADMIN_EMAIL and a 12+ character DEFAULT_ADMIN_PASSWORD.');
    return;
  }
  const email = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) return;
  await User.create({ name: DEFAULT_ADMIN_NAME, email, passwordHash: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12), role: 'admin' });
  console.log(`Created default administrator account for ${email}.`);
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/magicworld-launcher')
  .then(async () => { await seedDefaultAdmin(); await seedIfEmpty(); app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`)); })
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
