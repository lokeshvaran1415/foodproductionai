const mongoose = require('mongoose');

const productionPlanSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String },
  date: { type: Date, required: true },
  plannedQty: { type: Number, required: true },
  forecastDemand: { type: Number, default: 0 },
  currentInventory: { type: Number, default: 0 },
  requiredProduction: { type: Number, default: 0 },
  productionLine: { type: String, default: 'Line A' },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ProductionPlan', productionPlanSchema);
