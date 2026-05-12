import express from 'express';
import admin from 'firebase-admin';
import { protect, adminCheck } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  const db = admin.firestore();
  try {
    let query: admin.firestore.Query = db.collection('products');

    if (req.query.category && req.query.category !== 'all') {
      query = query.where('category', '==', req.query.category);
    }

    const snapshot = await query.get();
    let products = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    // Filter by keyword manually if needed (Firestore doesn't support easy partial matches without external tools)
    if (req.query.keyword) {
      const keyword = (req.query.keyword as string).toLowerCase();
      products = products.filter((p: any) => 
        p.name?.toLowerCase().includes(keyword) || 
        p.description?.toLowerCase().includes(keyword)
      );
    }

    res.json(products);
  } catch (error) {
    console.error('Firestore Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  const db = admin.firestore();
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (doc.exists) {
      res.json({ _id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin)
router.post('/', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const productData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('products').add(productData);
    res.status(201).json({ _id: docRef.id, ...productData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
