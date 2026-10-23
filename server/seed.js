require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const RawMaterial = require('./models/RawMaterial');
const InventoryBatch = require('./models/InventoryBatch');
const DemandForecast = require('./models/DemandForecast');
const ProductionPlan = require('./models/ProductionPlan');
const Alert = require('./models/Alert');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_production_ai';

const seed = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      RawMaterial.deleteMany({}),
      InventoryBatch.deleteMany({}),
      DemandForecast.deleteMany({}),
      ProductionPlan.deleteMany({}),
      Alert.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // --- USERS ---
    const passwordHash = await bcrypt.hash('demo1234', 10);
    const users = await User.insertMany([
      { name: 'Admin User',       email: 'admin@foodprod.com',      password: passwordHash, role: 'admin' },
      { name: 'Rajesh Kumar',     email: 'production@foodprod.com', password: passwordHash, role: 'production_manager' },
      { name: 'Rajesh Kumar',     email: 'manager@foodprod.com',    password: passwordHash, role: 'production_manager' },
      { name: 'Ananya Iyer',      email: 'planner@foodprod.com',    password: passwordHash, role: 'demand_planner' },
      { name: 'Vikram Singh',     email: 'inventory@foodprod.com',  password: passwordHash, role: 'inventory_manager' }
    ]);
    console.log('👥 Users seeded');

    // --- RAW MATERIALS ---
    const materials = await RawMaterial.insertMany([
      { name: 'Wheat Flour',  unit: 'kg',  quantity: 850,  reorderLevel: 300, shelfLifeDays: 180, costPerUnit: 35,  supplier: 'Agro Mills Ltd' },
      { name: 'Sugar',        unit: 'kg',  quantity: 420,  reorderLevel: 150, shelfLifeDays: 365, costPerUnit: 45,  supplier: 'Sweet Supply Co' },
      { name: 'Milk',         unit: 'L',   quantity: 95,   reorderLevel: 120, shelfLifeDays: 5,   costPerUnit: 55,  supplier: 'Fresh Dairy Farm' },
      { name: 'Butter',       unit: 'kg',  quantity: 48,   reorderLevel: 60,  shelfLifeDays: 30,  costPerUnit: 450, supplier: 'Amul Distributors' },
      { name: 'Eggs',         unit: 'pcs', quantity: 1200, reorderLevel: 500, shelfLifeDays: 21,  costPerUnit: 8,   supplier: 'Poultry Direct' },
      { name: 'Cocoa Powder', unit: 'kg',  quantity: 75,   reorderLevel: 80,  shelfLifeDays: 365, costPerUnit: 320, supplier: 'Choco Imports' },
      { name: 'Yeast',        unit: 'kg',  quantity: 35,   reorderLevel: 20,  shelfLifeDays: 90,  costPerUnit: 180, supplier: 'BioTech Supplies' },
      { name: 'Salt',         unit: 'kg',  quantity: 200,  reorderLevel: 50,  shelfLifeDays: 1825,costPerUnit: 15,  supplier: 'Salt Works India' }
    ]);
    console.log('🧪 Raw materials seeded');

    const flourId   = materials[0]._id;
    const sugarId   = materials[1]._id;
    const milkId    = materials[2]._id;
    const butterId  = materials[3]._id;
    const eggsId    = materials[4]._id;
    const cocoaId   = materials[5]._id;
    const yeastId   = materials[6]._id;
    const saltId    = materials[7]._id;

    // --- PRODUCTS ---
    const products = await Product.insertMany([
      {
        name: 'Bread', unit: 'loaves', shelfLifeDays: 5, category: 'Bakery', currentStock: 250,
        recipe: [
          { materialId: flourId,  materialName: 'Wheat Flour', quantityPerUnit: 0.5,   unit: 'kg' },
          { materialId: yeastId,  materialName: 'Yeast',       quantityPerUnit: 0.01,  unit: 'kg' },
          { materialId: saltId,   materialName: 'Salt',        quantityPerUnit: 0.005, unit: 'kg' }
        ]
      },
      {
        name: 'Biscuits', unit: 'packs', shelfLifeDays: 60, category: 'Bakery', currentStock: 180,
        recipe: [
          { materialId: flourId,  materialName: 'Wheat Flour', quantityPerUnit: 0.3,   unit: 'kg' },
          { materialId: sugarId,  materialName: 'Sugar',       quantityPerUnit: 0.15,  unit: 'kg' },
          { materialId: butterId, materialName: 'Butter',      quantityPerUnit: 0.08,  unit: 'kg' }
        ]
      },
      {
        name: 'Cake', unit: 'units', shelfLifeDays: 7, category: 'Bakery', currentStock: 90,
        recipe: [
          { materialId: flourId,  materialName: 'Wheat Flour', quantityPerUnit: 0.4,   unit: 'kg' },
          { materialId: sugarId,  materialName: 'Sugar',       quantityPerUnit: 0.2,   unit: 'kg' },
          { materialId: eggsId,   materialName: 'Eggs',        quantityPerUnit: 3,     unit: 'pcs' },
          { materialId: butterId, materialName: 'Butter',      quantityPerUnit: 0.1,   unit: 'kg' },
          { materialId: cocoaId,  materialName: 'Cocoa Powder',quantityPerUnit: 0.05,  unit: 'kg' }
        ]
      },
      {
        name: 'Milk Packet', unit: 'packets', shelfLifeDays: 3, category: 'Dairy', currentStock: 320,
        recipe: [
          { materialId: milkId, materialName: 'Milk', quantityPerUnit: 1, unit: 'L' }
        ]
      },
      {
        name: 'Yogurt', unit: 'cups', shelfLifeDays: 10, category: 'Dairy', currentStock: 140,
        recipe: [
          { materialId: milkId,  materialName: 'Milk',  quantityPerUnit: 0.2, unit: 'L' },
          { materialId: sugarId, materialName: 'Sugar', quantityPerUnit: 0.02, unit: 'kg' }
        ]
      }
    ]);
    console.log('🍞 Products seeded');

    // --- INVENTORY BATCHES ---
    const today = new Date();
    const daysFromNow = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
    const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

    await InventoryBatch.collection.insertMany([
      { materialId: flourId,  materialName: 'Wheat Flour',  batchCode: 'FL-2024-001', quantity: 500, unit: 'kg',  receivedDate: daysAgo(10), expiryDate: daysFromNow(170), status: 'normal',       costPerUnit: 35  },
      { materialId: flourId,  materialName: 'Wheat Flour',  batchCode: 'FL-2024-002', quantity: 350, unit: 'kg',  receivedDate: daysAgo(5),  expiryDate: daysFromNow(175), status: 'normal',       costPerUnit: 35  },
      { materialId: sugarId,  materialName: 'Sugar',        batchCode: 'SG-2024-001', quantity: 420, unit: 'kg',  receivedDate: daysAgo(20), expiryDate: daysFromNow(340), status: 'normal',       costPerUnit: 45  },
      { materialId: milkId,   materialName: 'Milk',         batchCode: 'MK-2024-001', quantity: 95,  unit: 'L',   receivedDate: daysAgo(2),  expiryDate: daysFromNow(2),   status: 'expiring_soon',costPerUnit: 55  },
      { materialId: butterId, materialName: 'Butter',       batchCode: 'BT-2024-001', quantity: 30,  unit: 'kg',  receivedDate: daysAgo(25), expiryDate: daysFromNow(2),   status: 'expiring_soon',costPerUnit: 450 },
      { materialId: butterId, materialName: 'Butter',       batchCode: 'BT-2024-002', quantity: 18,  unit: 'kg',  receivedDate: daysAgo(30), expiryDate: daysFromNow(-1),  status: 'expired',      costPerUnit: 450 },
      { materialId: eggsId,   materialName: 'Eggs',         batchCode: 'EG-2024-001', quantity: 1200,unit: 'pcs', receivedDate: daysAgo(3),  expiryDate: daysFromNow(18),  status: 'normal',       costPerUnit: 8   },
      { materialId: cocoaId,  materialName: 'Cocoa Powder', batchCode: 'CC-2024-001', quantity: 75,  unit: 'kg',  receivedDate: daysAgo(15), expiryDate: daysFromNow(350), status: 'normal',       costPerUnit: 320 },
      { materialId: yeastId,  materialName: 'Yeast',        batchCode: 'YS-2024-001', quantity: 35,  unit: 'kg',  receivedDate: daysAgo(7),  expiryDate: daysFromNow(83),  status: 'normal',       costPerUnit: 180 },
      { materialId: saltId,   materialName: 'Salt',         batchCode: 'SL-2024-001', quantity: 200, unit: 'kg',  receivedDate: daysAgo(60), expiryDate: daysFromNow(1765),status: 'normal',       costPerUnit: 15  }
    ]);
    console.log('📦 Inventory batches seeded');

    // --- DEMAND FORECASTS ---
    const historicalBread = [
      { date: daysAgo(30), qty: 920 }, { date: daysAgo(25), qty: 980 },
      { date: daysAgo(20), qty: 1010 }, { date: daysAgo(15), qty: 1050 },
      { date: daysAgo(10), qty: 1080 }, { date: daysAgo(5), qty: 1095 }
    ];
    const historicalBiscuits = [
      { date: daysAgo(30), qty: 540 }, { date: daysAgo(25), qty: 580 },
      { date: daysAgo(20), qty: 610 }, { date: daysAgo(15), qty: 590 },
      { date: daysAgo(10), qty: 630 }, { date: daysAgo(5), qty: 655 }
    ];
    const historicalCake = [
      { date: daysAgo(30), qty: 210 }, { date: daysAgo(25), qty: 235 },
      { date: daysAgo(20), qty: 220 }, { date: daysAgo(15), qty: 260 },
      { date: daysAgo(10), qty: 275 }, { date: daysAgo(5), qty: 290 }
    ];
    const historicalMilk = [
      { date: daysAgo(30), qty: 1400 }, { date: daysAgo(25), qty: 1450 },
      { date: daysAgo(20), qty: 1420 }, { date: daysAgo(15), qty: 1480 },
      { date: daysAgo(10), qty: 1510 }, { date: daysAgo(5), qty: 1550 }
    ];
    const historicalYogurt = [
      { date: daysAgo(30), qty: 380 }, { date: daysAgo(25), qty: 400 },
      { date: daysAgo(20), qty: 420 }, { date: daysAgo(15), qty: 415 },
      { date: daysAgo(10), qty: 445 }, { date: daysAgo(5), qty: 460 }
    ];

    await DemandForecast.insertMany([
      { productId: products[0]._id, productName: 'Bread',       date: daysFromNow(1), predictedQty: 1125, confidence: 88, method: 'Weighted Moving Average + Trend', historicalData: historicalBread },
      { productId: products[1]._id, productName: 'Biscuits',    date: daysFromNow(1), predictedQty: 672,  confidence: 82, method: 'Weighted Moving Average + Trend', historicalData: historicalBiscuits },
      { productId: products[2]._id, productName: 'Cake',        date: daysFromNow(1), predictedQty: 305,  confidence: 79, method: 'Weighted Moving Average + Trend', historicalData: historicalCake },
      { productId: products[3]._id, productName: 'Milk Packet', date: daysFromNow(1), predictedQty: 1580, confidence: 91, method: 'Weighted Moving Average + Trend', historicalData: historicalMilk },
      { productId: products[4]._id, productName: 'Yogurt',      date: daysFromNow(1), predictedQty: 478,  confidence: 85, method: 'Weighted Moving Average + Trend', historicalData: historicalYogurt }
    ]);
    console.log('📊 Demand forecasts seeded');

    // --- PRODUCTION PLANS ---
    await ProductionPlan.insertMany([
      { productId: products[0]._id, productName: 'Bread',       date: today,          plannedQty: 875,  forecastDemand: 1125, currentInventory: 250, requiredProduction: 875,  productionLine: 'Line A', status: 'in_progress' },
      { productId: products[1]._id, productName: 'Biscuits',    date: today,          plannedQty: 490,  forecastDemand: 672,  currentInventory: 182, requiredProduction: 490,  productionLine: 'Line B', status: 'planned' },
      { productId: products[2]._id, productName: 'Cake',        date: today,          plannedQty: 215,  forecastDemand: 305,  currentInventory: 90,  requiredProduction: 215,  productionLine: 'Line A', status: 'planned' },
      { productId: products[3]._id, productName: 'Milk Packet', date: today,          plannedQty: 1260, forecastDemand: 1580, currentInventory: 320, requiredProduction: 1260, productionLine: 'Line C', status: 'in_progress' },
      { productId: products[4]._id, productName: 'Yogurt',      date: today,          plannedQty: 340,  forecastDemand: 478,  currentInventory: 140, requiredProduction: 338,  productionLine: 'Line C', status: 'planned' },
      { productId: products[0]._id, productName: 'Bread',       date: daysAgo(1),     plannedQty: 900,  forecastDemand: 1095, currentInventory: 200, requiredProduction: 895,  productionLine: 'Line A', status: 'completed' },
      { productId: products[1]._id, productName: 'Biscuits',    date: daysAgo(1),     plannedQty: 500,  forecastDemand: 655,  currentInventory: 155, requiredProduction: 500,  productionLine: 'Line B', status: 'completed' },
      { productId: products[0]._id, productName: 'Bread',       date: daysFromNow(1), plannedQty: 1100, forecastDemand: 1125, currentInventory: 0,   requiredProduction: 1125, productionLine: 'Line A', status: 'planned' },
      { productId: products[3]._id, productName: 'Milk Packet', date: daysFromNow(1), plannedQty: 1500, forecastDemand: 1580, currentInventory: 0,   requiredProduction: 1580, productionLine: 'Line C', status: 'planned' }
    ]);
    console.log('🏭 Production plans seeded');

    // --- ALERTS ---
    await Alert.insertMany([
      {
        type: 'low_stock', severity: 'critical',
        message: 'Milk inventory has fallen below reorder level.',
        detail: 'Current: 95 L | Reorder Level: 120 L | Supplier: Fresh Dairy Farm',
        status: 'active'
      },
      {
        type: 'low_stock', severity: 'warning',
        message: 'Butter inventory is critically low.',
        detail: 'Current: 48 kg | Reorder Level: 60 kg | Supplier: Amul Distributors',
        status: 'active'
      },
      {
        type: 'low_stock', severity: 'warning',
        message: 'Cocoa Powder is approaching reorder level.',
        detail: 'Current: 75 kg | Reorder Level: 80 kg',
        status: 'active'
      },
      {
        type: 'expiry', severity: 'warning',
        message: 'Milk batch MK-2024-001 expires in 2 days.',
        detail: 'Batch: MK-2024-001 | Qty: 95 L | Expiry: ' + daysFromNow(2).toLocaleDateString(),
        status: 'active'
      },
      {
        type: 'expiry', severity: 'warning',
        message: 'Butter batch BT-2024-001 expires in 2 days.',
        detail: 'Batch: BT-2024-001 | Qty: 30 kg | Expiry: ' + daysFromNow(2).toLocaleDateString(),
        status: 'active'
      },
      {
        type: 'expiry', severity: 'critical',
        message: 'Butter batch BT-2024-002 has EXPIRED.',
        detail: 'Batch: BT-2024-002 | Qty: 18 kg — Immediate disposal required.',
        status: 'active'
      },
      {
        type: 'demand_spike', severity: 'info',
        message: 'Projected demand for Bread increased by 15% vs last week.',
        detail: 'Previous forecast: 980 units | New forecast: 1125 units (+14.8%)',
        status: 'active'
      },
      {
        type: 'production_risk', severity: 'warning',
        message: 'Current Milk Packet production plan may not satisfy forecasted demand.',
        detail: 'Planned: 1260 packets | Forecast Demand: 1580 packets | Shortfall: 320 packets',
        status: 'active'
      },
      {
        type: 'stockout', severity: 'info',
        message: 'Yogurt production shortfall detected.',
        detail: 'At current rate, Yogurt stock may reach zero in 3 days without replenishment.',
        status: 'acknowledged'
      }
    ]);
    console.log('🚨 Alerts seeded');

    console.log('\n✅ Seed complete! Demo credentials:');
    console.log('   Admin:              admin@foodprod.com      / demo1234');
    console.log('   Production Manager: manager@foodprod.com   / demo1234');
    console.log('   Demand Planner:     planner@foodprod.com   / demo1234');
    console.log('   Inventory Manager:  inventory@foodprod.com / demo1234');

    if (shouldExit) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seed failed:', err);
    if (shouldExit) {
      process.exit(1);
    }
    throw err;
  }
};

module.exports = seed;

if (require.main === module) {
  seed(true);
}
