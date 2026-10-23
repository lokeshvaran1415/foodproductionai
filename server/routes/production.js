const express = require('express');
const router = express.Router();
const { getAllPlans, getPlanById, createPlan, updatePlan, deletePlan } = require('../controllers/productionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllPlans);
router.get('/:id', protect, getPlanById);
router.post('/', protect, createPlan);
router.put('/:id', protect, updatePlan);
router.delete('/:id', protect, deletePlan);

module.exports = router;
