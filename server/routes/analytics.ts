import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { Order } from '../models/Order.ts';
import { protect, admin } from '../middleware/authMiddleware.ts';

const router = express.Router();

const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// GET /api/analytics/global-delivery
router.get('/global-delivery', analyticsLimiter, protect, admin, async (req, res) => {
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

    if (mongoose.connection.readyState !== 1) {
      // Mock global data
      summary.total_orders = 1250;
      summary.delivered = 1050;
      summary.failed = 150;
      summary.pending = 50;
      summary.success_rate = 84;
      
      couriers.Pathao = { total: 500, delivered: 420, failed: 60 };
      couriers.RedX = { total: 400, delivered: 330, failed: 50 };
      couriers.Sundarban = { total: 200, delivered: 180, failed: 10 };
      couriers.None = { total: 150, delivered: 120, failed: 30 };
    } else {
      const orders = await Order.find({}, 'deliveryStatus courierName orderStatus');
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
router.get('/customer-delivery/:phone', analyticsLimiter, protect, admin, async (req, res) => {
  try {
    const { phone } = req.params;

    // We can match both phoneNumber, shippingAddress.phone
    let orders = [];

    if (mongoose.connection.readyState !== 1) {
      // Return mock data if no database connection (preview mode)
      orders = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          customerName: 'Test Customer',
          phoneNumber: phone,
          totalAmount: 1200,
          courierName: 'Pathao',
          trackingId: 'PTH-1001',
          deliveryStatus: 'delivered',
          orderDate: new Date('2023-10-01'),
          deliveryDate: new Date('2023-10-04'),
          items: [{ name: 'Classic White T-Shirt', quantity: 2, price: 600 }]
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          customerName: 'Test Customer',
          phoneNumber: phone,
          totalAmount: 550,
          courierName: 'RedX',
          trackingId: 'RDX-1002',
          deliveryStatus: 'failed',
          orderDate: new Date('2023-10-15'),
          items: [{ name: 'Black Cap', quantity: 1, price: 550 }]
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          customerName: 'Test Customer',
          phoneNumber: phone,
          totalAmount: 3200,
          courierName: 'Sundarban',
          trackingId: 'SND-1003',
          deliveryStatus: 'pending',
          orderDate: new Date(),
          items: [{ name: 'Denim Jacket', quantity: 1, price: 3200 }]
        }
      ];
    } else {
      orders = await Order.find({
        $or: [
          { phoneNumber: phone },
          { 'shippingAddress.phone': phone }
        ]
      });
    }

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
