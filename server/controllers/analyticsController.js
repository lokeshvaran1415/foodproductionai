const DEMO_ANALYTICS_DATA = {
  productComparison: [
    { name: 'Bread',       demand: 1125, production: 875,  gap: 250 },
    { name: 'Biscuits',    demand: 672,  production: 490,  gap: 182 },
    { name: 'Cake',        demand: 305,  production: 215,  gap: 90  },
    { name: 'Milk Packet', demand: 1580, production: 1260, gap: 320 },
    { name: 'Yogurt',      demand: 478,  production: 340,  gap: 138 }
  ],
  inventoryUtilization: [
    { name: 'Wheat Flour',  quantity: 850,  reorderLevel: 300, utilization: 94, status: 'normal' },
    { name: 'Sugar',        quantity: 420,  reorderLevel: 150, utilization: 93, status: 'normal' },
    { name: 'Milk',         quantity: 95,   reorderLevel: 120, utilization: 26, status: 'low' },
    { name: 'Butter',       quantity: 48,   reorderLevel: 60,  utilization: 27, status: 'low' },
    { name: 'Eggs',         quantity: 1200, reorderLevel: 500, utilization: 80, status: 'normal' },
    { name: 'Cocoa Powder', quantity: 75,   reorderLevel: 80,  utilization: 31, status: 'low' },
    { name: 'Yeast',        quantity: 35,   reorderLevel: 20,  utilization: 58, status: 'normal' },
    { name: 'Salt',         quantity: 200,  reorderLevel: 50,  utilization: 44, status: 'normal' }
  ],
  wasteRisk: { expired: 1, expiringSoon: 2, expiringWeek: 3 },
  weeklyTrend: [
    { date: 'Mon', production: 2400, demand: 2600 },
    { date: 'Tue', production: 2700, demand: 2850 },
    { date: 'Wed', production: 2900, demand: 2750 },
    { date: 'Thu', production: 3100, demand: 3200 },
    { date: 'Fri', production: 3400, demand: 3550 },
    { date: 'Sat', production: 2800, demand: 2900 },
    { date: 'Sun', production: 2200, demand: 2400 }
  ],
  totalProducts: 5,
  totalMaterials: 8
};

const getAnalytics = async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(DEMO_ANALYTICS_DATA);
  try {
    const Product = require('../models/Product');
    const ProductionPlan = require('../models/ProductionPlan');
    const DemandForecast = require('../models/DemandForecast');
    const RawMaterial = require('../models/RawMaterial');
    const InventoryBatch = require('../models/InventoryBatch');

    const today = new Date();
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const plans = await ProductionPlan.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: 1 });
    const products = await Product.find();
    const productComparison = [];
    for (const p of products) {
      const forecast = await DemandForecast.findOne({ productId: p._id });
      const plan = await ProductionPlan.findOne({ productId: p._id, status: { $ne: 'cancelled' } }).sort({ date: -1 });
      if (forecast) productComparison.push({ name: p.name, demand: forecast.predictedQty, production: plan ? plan.plannedQty : 0, gap: forecast.predictedQty - (plan ? plan.plannedQty : 0) });
    }
    const materials = await RawMaterial.find();
    const inventoryUtil = materials.map(m => ({ name: m.name, quantity: m.quantity, reorderLevel: m.reorderLevel, utilization: m.reorderLevel > 0 ? Math.round((m.quantity / (m.reorderLevel * 3)) * 100) : 100, status: m.quantity <= m.reorderLevel ? 'low' : m.quantity <= m.reorderLevel * 1.5 ? 'warning' : 'normal' }));
    const threeDays = new Date(today); threeDays.setDate(threeDays.getDate() + 3);
    const sevenDays = new Date(today); sevenDays.setDate(sevenDays.getDate() + 7);
    const expiredCount = await InventoryBatch.countDocuments({ expiryDate: { $lt: today } });
    const expiringSoonCount = await InventoryBatch.countDocuments({ expiryDate: { $gte: today, $lte: threeDays } });
    const expiringWeekCount = await InventoryBatch.countDocuments({ expiryDate: { $gte: today, $lte: sevenDays } });
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today); day.setDate(day.getDate() - i);
      const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);
      const dayPlans = plans.filter(p => new Date(p.date) >= dayStart && new Date(p.date) <= dayEnd);
      weeklyData.push({ date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), production: dayPlans.reduce((s, p) => s + p.plannedQty, 0), demand: 0 });
    }
    res.json({ productComparison: productComparison.length > 0 ? productComparison : DEMO_ANALYTICS_DATA.productComparison, inventoryUtilization: inventoryUtil, wasteRisk: { expired: expiredCount, expiringSoon: expiringSoonCount, expiringWeek: expiringWeekCount }, weeklyTrend: weeklyData, totalProducts: products.length, totalMaterials: materials.length });
  } catch { res.json(DEMO_ANALYTICS_DATA); }
};

module.exports = { getAnalytics };
