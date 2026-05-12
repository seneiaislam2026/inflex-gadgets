import express from 'express';
import { Product } from '../models/Product.ts';
import { protect, admin } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword as string,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category && req.query.category !== 'all'
      ? { category: req.query.category as string }
      : {};

    const products = await Product.find({ ...keyword, ...category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
