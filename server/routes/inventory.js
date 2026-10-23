const express = require('express');
const router = express.Router();
const { getMaterials, updateMaterial, getBatches, addBatch, getExpiringBatches } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/materials', protect, getMaterials);
router.put('/materials/:id', protect, updateMaterial);
router.get('/batches', protect, getBatches);
router.post('/batches', protect, addBatch);
router.get('/expiring', protect, getExpiringBatches);

module.exports = router;
