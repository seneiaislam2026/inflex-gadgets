import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

// Load Firebase Config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error('[Server] Failed to load firebase-applet-config.json', err);
}

import authRoutes from './server/routes/auth.ts';
import productRoutes from './server/routes/products.ts';
import orderRoutes from './server/routes/orders.ts';
import partnerRoutes from './server/routes/partners.ts';
import invoiceRoutes from './server/routes/invoices.ts';
import analyticsRoutes from './server/routes/analytics.ts';

import { startCourierSyncJob } from './server/jobs/courierSyncJob.ts';

// Initialize Firebase Admin
if (firebaseConfig.projectId) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log('[Server] Firebase Admin initialized for project:', firebaseConfig.projectId);
  } catch (err) {
    console.error('[Server] Failed to initialize Firebase Admin', err);
  }
} else {
  console.error('[Server] Missing projectId in firebase-applet-config.json');
}

async function startServer() {
  console.log('[Server] Initializing Express app...');
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  console.log(`[Server] Starting in ${process.env.NODE_ENV || 'development'} mode`);

  // Start background jobs
  try {
    startCourierSyncJob();
    console.log('[Server] Background jobs started');
  } catch (err) {
    console.error('[Server] Failed to start background jobs', err);
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/partners', partnerRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'firestore', env: process.env.NODE_ENV || 'development' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Setting up Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const rootPath = process.cwd();
    const distPath = path.join(rootPath, 'dist');
    console.log(`[Prod] Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('[Prod] Error sending index.html:', err);
          res.status(500).send('Application build missing or inaccessible.');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] READY and running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] FATAL ERROR during startup:', err);
  process.exit(1);
});
