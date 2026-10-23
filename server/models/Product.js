const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
  materialName: String,
  quantityPerUnit: Number,
  unit: String
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, default: 'units' },
  shelfLifeDays: { type: Number, default: 7 },
  category: { type: String, default: 'Bakery' },
  recipe: [ingredientSchema],
  currentStock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
