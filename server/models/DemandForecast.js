const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String },
  date: { type: Date, required: true },
  predictedQty: { type: Number, required: true },
  actualQty: { type: Number, default: null },
  confidence: { type: Number, default: 85 }, // percentage
  method: { type: String, default: 'Moving Average' },
  historicalData: [{ date: Date, qty: Number }]
}, { timestamps: true });

module.exports = mongoose.model('DemandForecast', demandForecastSchema);
