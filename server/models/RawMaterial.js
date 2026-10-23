const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 100 },
  shelfLifeDays: { type: Number, default: 30 },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: String, default: 'Default Supplier' }
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
