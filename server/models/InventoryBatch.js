const mongoose = require('mongoose');

const inventoryBatchSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  materialName: { type: String },
  batchCode: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String },
  receivedDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['normal', 'low_stock', 'expiring_soon', 'expired'],
    default: 'normal'
  },
  costPerUnit: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-compute status before save
inventoryBatchSchema.pre('save', function (next) {
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 0) this.status = 'expired';
  else if (daysUntilExpiry <= 3) this.status = 'expiring_soon';
  else this.status = 'normal';
  next();
});

module.exports = mongoose.model('InventoryBatch', inventoryBatchSchema);
