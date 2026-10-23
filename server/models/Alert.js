const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low_stock', 'expiry', 'demand_spike', 'production_risk', 'stockout', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'warning'
  },
  message: { type: String, required: true },
  detail: { type: String, default: '' },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
  status: {
    type: String,
    enum: ['active', 'resolved', 'acknowledged'],
    default: 'active'
  },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
