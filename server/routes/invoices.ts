import express from 'express';
import admin from 'firebase-admin';
import { protect, adminCheck } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Get all invoices (Admin)
router.get('/', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
    const invoices = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new invoice (Admin)
router.post('/', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const {
      customerName,
      customerEmail,
      customerAddress,
      items,
      taxAmount,
      discountAmount,
    } = req.body;

    let subtotal = 0;
    if (items && items.length > 0) {
      subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
    }
    
    // Process items totals
    const processedItems = items.map((item: any) => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const totalAmount = subtotal + (taxAmount || 0) - (discountAmount || 0);
    const invoiceNumber = `INV-${Date.now()}`;

    const invoiceData = {
      invoiceNumber,
      customerName,
      customerEmail,
      customerAddress,
      items: processedItems,
      subtotal,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      totalAmount,
      status: 'draft',
      issueDate: admin.firestore.FieldValue.serverTimestamp(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('invoices').add(invoiceData);
    res.status(201).json({ _id: docRef.id, ...invoiceData });
  } catch (error) {
    console.error('Invoice Creation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invoice by ID
router.get('/:id', protect, adminCheck, async (req, res) => {
  const db = admin.firestore();
  try {
    const doc = await db.collection('invoices').doc(req.params.id).get();
    if (doc.exists) {
      res.json({ _id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
