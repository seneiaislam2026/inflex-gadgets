import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.ts';
import productRoutes from './server/routes/products.ts';
import orderRoutes from './server/routes/orders.ts';
import partnerRoutes from './server/routes/partners.ts';
import invoiceRoutes from './server/routes/invoices.ts';
import analyticsRoutes from './server/routes/analytics.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { startCourierSyncJob } from './server/jobs/courierSyncJob.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
      // Start background jobs after successful db connection
      startCourierSyncJob();
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
    }
  } else {
    console.warn('No MONGO_URI provided in environment variables.');
    console.warn('The application will start, but database operations will fail.');
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/partners', partnerRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', dbConnected: mongoose.connection.readyState === 1 });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Handle generic SPA routes
  if (process.env.NODE_ENV !== 'production') {
    // In dev mode, Vite handles SPA fallback automatically
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
