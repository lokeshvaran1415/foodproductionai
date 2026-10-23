const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const DEMO_PRODUCTS = [
  { _id: 'p1', name: 'Bread',       unit: 'loaves',  shelfLifeDays: 5,  category: 'Bakery', currentStock: 250 },
  { _id: 'p2', name: 'Biscuits',    unit: 'packs',   shelfLifeDays: 60, category: 'Bakery', currentStock: 182 },
  { _id: 'p3', name: 'Cake',        unit: 'units',   shelfLifeDays: 7,  category: 'Bakery', currentStock: 90  },
  { _id: 'p4', name: 'Milk Packet', unit: 'packets', shelfLifeDays: 3,  category: 'Dairy',  currentStock: 320 },
  { _id: 'p5', name: 'Yogurt',      unit: 'cups',    shelfLifeDays: 10, category: 'Dairy',  currentStock: 140 }
];

router.get('/', protect, async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(DEMO_PRODUCTS);
  try {
    const Product = require('../models/Product');
    const products = await Product.find();
    res.json(products.length > 0 ? products : DEMO_PRODUCTS);
  } catch { res.json(DEMO_PRODUCTS); }
});

router.get('/:id', protect, async (req, res) => {
  if (!global.DB_CONNECTED) {
    const p = DEMO_PRODUCTS.find(x => x._id === req.params.id);
    return p ? res.json(p) : res.status(404).json({ message: 'Product not found' });
  }
  try {
    const Product = require('../models/Product');
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'DB not available in demo mode' });
  try {
    const Product = require('../models/Product');
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
