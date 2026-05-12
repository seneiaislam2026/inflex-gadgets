import express from 'express';
import admin from 'firebase-admin';
import { protect, adminCheck } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Get all partners (Admin)
router.get('/', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const snapshot = await db.collection('partners').get();
    const partners = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add partner (Admin)
router.post('/', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const partnerData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('partners').add(partnerData);
    res.status(201).json({ _id: docRef.id, ...partnerData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
