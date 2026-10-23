const express = require('express');
const router = express.Router();
const { getAlerts, resolveAlert, acknowledgeAlert, generateAlerts } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAlerts);
router.post('/generate', protect, generateAlerts);
router.put('/:id/resolve', protect, resolveAlert);
router.put('/:id/acknowledge', protect, acknowledgeAlert);

module.exports = router;
