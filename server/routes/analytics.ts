import express from 'express';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import { protect, adminCheck } from '../middleware/authMiddleware.ts';

const router = express.Router();

const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// GET /api/analytics/global-delivery
router.get('/global-delivery', analyticsLimiter, protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const summary = {
      total_orders: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      success_rate: 0
    };

    const couriers: Record<string, any> = {
      Pathao: { total: 0, delivered: 0, failed: 0 },
      RedX: { total: 0, delivered: 0, failed: 0 },
      Sundarban: { total: 0, delivered: 0, failed: 0 },
      None: { total: 0, delivered: 0, failed: 0 }
    };

    const snapshot = await db.collection('orders').get();
    const orders = snapshot.docs.map(doc => doc.data());
    
    summary.total_orders = orders.length;
    
    orders.forEach(order => {
      const status = order.deliveryStatus || order.orderStatus;
      const courier = order.courierName || 'None';

      if (status === 'delivered') summary.delivered++;
      else if (['failed', 'returned', 'cancelled'].includes(status)) summary.failed++;
      else summary.pending++;

      if (!couriers[courier]) couriers[courier] = { total: 0, delivered: 0, failed: 0 };
      
      couriers[courier].total++;
      if (status === 'delivered') couriers[courier].delivered++;
      else if (['failed', 'returned', 'cancelled'].includes(status)) couriers[courier].failed++;
    });

    if (summary.total_orders > 0) {
      summary.success_rate = Math.round((summary.delivered / summary.total_orders) * 100);
    }

    res.json({
      summary,
      couriers
    });

  } catch (error) {
    console.error('Global analytics error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/analytics/customer-delivery/:phone
router.get('/customer-delivery/:phone', analyticsLimiter, protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const { phone } = req.params;

    const snapshot1 = await db.collection('orders').where('phoneNumber', '==', phone).get();
    const snapshot2 = await db.collection('orders').where('shippingAddress.phone', '==', phone).get();
    
    // Combine local results since Firestore doesn't support OR across fields easily in simple queries
    const ordersMap = new Map();
    snapshot1.docs.forEach(doc => ordersMap.set(doc.id, { _id: doc.id, ...doc.data() }));
    snapshot2.docs.forEach(doc => ordersMap.set(doc.id, { _id: doc.id, ...doc.data() }));
    
    const orders = Array.from(ordersMap.values());

    const summary = {
      total_orders: orders.length,
      delivered: 0,
      failed: 0,
      pending: 0,
      success_rate: 0
    };

    const couriers: Record<string, any> = {
      Pathao: { total: 0, delivered: 0, failed: 0 },
      RedX: { total: 0, delivered: 0, failed: 0 },
      Sundarban: { total: 0, delivered: 0, failed: 0 },
      None: { total: 0, delivered: 0, failed: 0 }
    };

    orders.forEach(order => {
      const status = order.deliveryStatus;
      const courier = order.courierName || 'None';

      if (status === 'delivered') summary.delivered++;
      else if (['failed', 'returned', 'cancelled'].includes(status)) summary.failed++;
      else summary.pending++;

      if (!couriers[courier]) couriers[courier] = { total: 0, delivered: 0, failed: 0 };
      
      couriers[courier].total++;
      if (status === 'delivered') couriers[courier].delivered++;
      else if (['failed', 'returned', 'cancelled'].includes(status)) couriers[courier].failed++;
    });

    if (summary.total_orders > 0) {
      summary.success_rate = Math.round((summary.delivered / summary.total_orders) * 100);
    }

    res.json({
      phone,
      summary,
      couriers,
      orders
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
