import express from 'express';
import { Invoice } from '../models/Invoice.ts';
import { protect, admin } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Get all invoices (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const invoices = await Invoice.find({}).sort({ issueDate: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new invoice (Admin)
router.post('/', protect, admin, async (req, res) => {
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

    const invoice = new Invoice({
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
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    });

    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invoice by ID
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
