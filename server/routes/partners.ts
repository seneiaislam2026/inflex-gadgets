import express from 'express';
import { Partner } from '../models/Partner.ts';
import { protect, admin } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Get all partners (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add partner (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const partner = new Partner(req.body);
    const createdPartner = await partner.save();
    res.status(201).json(createdPartner);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
