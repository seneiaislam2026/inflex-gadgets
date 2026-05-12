import express from 'express';
import admin from 'firebase-admin';
import { protect, adminCheck, AuthRequest } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Create new order
router.post('/', protect, async (req: AuthRequest, res) => {
  const db = admin.firestore();
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const orderData = {
      userId: req.user.uid,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('orders').add(orderData);
    res.status(201).json({ _id: docRef.id, ...orderData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get logged in user orders
router.get('/myorders', protect, async (req: AuthRequest, res) => {
  const db = admin.firestore();
  try {
    const snapshot = await db.collection('orders').where('userId', '==', req.user.uid).get();
    const orders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  const db = admin.firestore();
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (doc.exists) {
      const orderData = doc.data();
      // Populate user info manually if needed
      res.json({ _id: doc.id, ...orderData });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update order status
router.put('/:id/status', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const orderRef = db.collection('orders').doc(req.params.id);
    const doc = await orderRef.get();
    
    if (doc.exists) {
      await orderRef.update({
        orderStatus: req.body.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const updatedDoc = await orderRef.get();
      res.json({ _id: updatedDoc.id, ...updatedDoc.data() });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
