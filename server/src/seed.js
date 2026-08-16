import dotenv from 'dotenv';
import mongoose from 'mongoose';
import App from './models/App.js';
dotenv.config();

const apps = [
  { name: 'Pulse Analytics', description: 'Real-time business metrics and beautiful performance dashboards.', type: 'web', category: 'Analytics', platforms: ['Web'], isFeatured: true, isNew: true, webUrl: 'https://example.com', currentVersion: '2.3.1', latestVersion: '2.3.1', owner: 'Data Team' },
  { name: 'Studio Desk', description: 'A focused workspace for creative projects, reviews and approvals.', type: 'desktop', category: 'Productivity', platforms: ['Windows', 'macOS'], downloadUrl: 'https://example.com', currentVersion: '4.1.0', latestVersion: '4.2.0', owner: 'Creative Team' },
  { name: 'Field Connect', description: 'Keep field teams connected, informed and ready for every job.', type: 'mobile', category: 'Operations', platforms: ['iOS', 'Android'], downloadUrl: 'https://example.com', currentVersion: '1.8.2', latestVersion: '1.8.2', isNew: true, owner: 'Operations' },
  { name: 'Vault', description: 'Securely request, organize and share company documents.', type: 'web', category: 'Security', platforms: ['Web'], webUrl: 'https://example.com', currentVersion: '3.0.4', latestVersion: '3.0.4', owner: 'Security Team' }
];
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/magicworld-launcher');
await App.deleteMany({});
await App.insertMany(apps);
console.log('Seeded app catalogue');
await mongoose.disconnect();
