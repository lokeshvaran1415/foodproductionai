const express = require('express');
const router = express.Router();
const { getAllForecasts, getForecastByProduct, generateForecast, getForecastsForAllProducts } = require('../controllers/forecastController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllForecasts);
router.get('/all-products', protect, getForecastsForAllProducts);
router.get('/product/:productId', protect, getForecastByProduct);
router.post('/generate/:productId', protect, generateForecast);

module.exports = router;
