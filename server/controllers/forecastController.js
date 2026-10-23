const DEMO_FORECASTS_ALL = [
  { productId: 'p1', productName: 'Bread',       unit: 'loaves',  predictedQty: 1125, confidence: 88, method: 'Weighted Moving Average + Trend Analysis', historicalData: [{ date: '5w ago', qty: 920 }, { date: '4w ago', qty: 980 }, { date: '3w ago', qty: 1010 }, { date: '2w ago', qty: 1050 }, { date: '1w ago', qty: 1080 }, { date: 'Last week', qty: 1095 }] },
  { productId: 'p2', productName: 'Biscuits',    unit: 'packs',   predictedQty: 672,  confidence: 82, method: 'Weighted Moving Average + Trend Analysis', historicalData: [{ date: '5w ago', qty: 540 }, { date: '4w ago', qty: 580 }, { date: '3w ago', qty: 610 }, { date: '2w ago', qty: 590 }, { date: '1w ago', qty: 630 }, { date: 'Last week', qty: 655 }] },
  { productId: 'p3', productName: 'Cake',        unit: 'units',   predictedQty: 305,  confidence: 79, method: 'Weighted Moving Average + Trend Analysis', historicalData: [{ date: '5w ago', qty: 210 }, { date: '4w ago', qty: 235 }, { date: '3w ago', qty: 220 }, { date: '2w ago', qty: 260 }, { date: '1w ago', qty: 275 }, { date: 'Last week', qty: 290 }] },
  { productId: 'p4', productName: 'Milk Packet', unit: 'packets', predictedQty: 1580, confidence: 91, method: 'Weighted Moving Average + Trend Analysis', historicalData: [{ date: '5w ago', qty: 1400 }, { date: '4w ago', qty: 1450 }, { date: '3w ago', qty: 1420 }, { date: '2w ago', qty: 1480 }, { date: '1w ago', qty: 1510 }, { date: 'Last week', qty: 1550 }] },
  { productId: 'p5', productName: 'Yogurt',      unit: 'cups',    predictedQty: 478,  confidence: 85, method: 'Weighted Moving Average + Trend Analysis', historicalData: [{ date: '5w ago', qty: 380 }, { date: '4w ago', qty: 400 }, { date: '3w ago', qty: 420 }, { date: '2w ago', qty: 415 }, { date: '1w ago', qty: 445 }, { date: 'Last week', qty: 460 }] }
];

const calculateForecast = (historicalData) => {
  if (!historicalData || historicalData.length === 0) return { predictedQty: 0, confidence: 50 };
  const qtys = historicalData.map(d => d.qty);
  const n = qtys.length;
  let weightedSum = 0, totalWeight = 0;
  for (let i = 0; i < n; i++) { const w = i + 1; weightedSum += qtys[i] * w; totalWeight += w; }
  const wma = weightedSum / totalWeight;
  const mean = qtys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - (n-1)/2) * (qtys[i] - mean); den += Math.pow(i - (n-1)/2, 2); }
  const trend = den !== 0 ? num / den : 0;
  const predicted = Math.round(wma + trend);
  const variance = qtys.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / n;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const confidence = Math.max(60, Math.min(97, Math.round(95 - cv * 100)));
  return { predictedQty: Math.max(0, predicted), confidence };
};

const getAllForecasts = async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(DEMO_FORECASTS_ALL);
  try {
    const DemandForecast = require('../models/DemandForecast');
    const forecasts = await DemandForecast.find().sort({ date: -1 }).populate('productId', 'name unit');
    res.json(forecasts);
  } catch { res.json(DEMO_FORECASTS_ALL); }
};

const getForecastByProduct = async (req, res) => {
  if (!global.DB_CONNECTED) {
    const f = DEMO_FORECASTS_ALL.find(x => x.productId === req.params.productId) || DEMO_FORECASTS_ALL[0];
    return res.json(f);
  }
  try {
    const DemandForecast = require('../models/DemandForecast');
    const forecast = await DemandForecast.findOne({ productId: req.params.productId }).sort({ date: -1 });
    if (!forecast) return res.status(404).json({ message: 'No forecast found' });
    res.json(forecast);
  } catch { res.json(DEMO_FORECASTS_ALL[0]); }
};

const generateForecast = async (req, res) => {
  if (!global.DB_CONNECTED) {
    const f = DEMO_FORECASTS_ALL.find(x => x.productId === req.params.productId) || DEMO_FORECASTS_ALL[0];
    const { predictedQty, confidence } = calculateForecast(f.historicalData);
    return res.json({ ...f, predictedQty, confidence });
  }
  try {
    const DemandForecast = require('../models/DemandForecast');
    const Product = require('../models/Product');
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const existing = await DemandForecast.findOne({ productId: req.params.productId });
    if (!existing) return res.status(404).json({ message: 'No historical data found' });
    const { predictedQty, confidence } = calculateForecast(existing.historicalData);
    existing.predictedQty = predictedQty; existing.confidence = confidence; existing.date = new Date();
    await existing.save();
    res.json({ ...existing.toObject(), productName: product.name, predictedQty, confidence });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getForecastsForAllProducts = async (req, res) => {
  if (!global.DB_CONNECTED) {
    return res.json(DEMO_FORECASTS_ALL.map(f => {
      const { predictedQty, confidence } = calculateForecast(f.historicalData);
      return { ...f, predictedQty, confidence };
    }));
  }
  try {
    const DemandForecast = require('../models/DemandForecast');
    const Product = require('../models/Product');
    const products = await Product.find();
    const results = [];
    for (const product of products) {
      const forecast = await DemandForecast.findOne({ productId: product._id }).sort({ date: -1 });
      if (forecast) {
        const { predictedQty, confidence } = calculateForecast(forecast.historicalData);
        results.push({ productId: product._id, productName: product.name, unit: product.unit, predictedQty, confidence, historicalData: forecast.historicalData, method: 'Weighted Moving Average + Trend Analysis' });
      }
    }
    res.json(results.length > 0 ? results : DEMO_FORECASTS_ALL);
  } catch { res.json(DEMO_FORECASTS_ALL); }
};

module.exports = { getAllForecasts, getForecastByProduct, generateForecast, getForecastsForAllProducts };
