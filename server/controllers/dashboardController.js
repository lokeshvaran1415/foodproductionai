// Demo data for when MongoDB is not available
const DEMO_DASHBOARD = {
  kpis: {
    todayProduction: 3240,
    forecastedDemand: 5160,
    inventoryValue: 284500,
    lowStockItems: 3,
    expiringBatches: 3,
    activeAlerts: 8
  },
  upcomingPlans: [
    { _id: '1', productName: 'Bread',       forecastDemand: 1125, plannedQty: 875,  productionLine: 'Line A', status: 'in_progress' },
    { _id: '2', productName: 'Biscuits',    forecastDemand: 672,  plannedQty: 490,  productionLine: 'Line B', status: 'planned' },
    { _id: '3', productName: 'Cake',        forecastDemand: 305,  plannedQty: 215,  productionLine: 'Line A', status: 'planned' },
    { _id: '4', productName: 'Milk Packet', forecastDemand: 1580, plannedQty: 1260, productionLine: 'Line C', status: 'in_progress' },
    { _id: '5', productName: 'Yogurt',      forecastDemand: 478,  plannedQty: 340,  productionLine: 'Line C', status: 'planned' }
  ],
  inventoryDistribution: { normal: 5, warning: 1, critical: 2 },
  totalMaterials: 8
};

// GET /api/dashboard
const getDashboardStats = async (req, res) => {
  if (!global.DB_CONNECTED) {
    return res.json(DEMO_DASHBOARD);
  }
  try {
    const ProductionPlan = require('../models/ProductionPlan');
    const RawMaterial = require('../models/RawMaterial');
    const InventoryBatch = require('../models/InventoryBatch');
    const Alert = require('../models/Alert');
    const DemandForecast = require('../models/DemandForecast');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPlans = await ProductionPlan.find({ date: { $gte: today, $lt: tomorrow } });
    const todayProduction = todayPlans.reduce((sum, p) => sum + p.plannedQty, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const forecasts = await DemandForecast.find({ date: { $gte: today, $lte: nextWeek } });
    const forecastedDemand = forecasts.reduce((sum, f) => sum + f.predictedQty, 0);

    const materials = await RawMaterial.find();
    const lowStockItems = materials.filter(m => m.quantity <= m.reorderLevel).length;
    const inventoryValue = materials.reduce((sum, m) => sum + (m.quantity * m.costPerUnit), 0);

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const expiringBatches = await InventoryBatch.countDocuments({ expiryDate: { $gte: today, $lte: threeDaysLater } });
    const activeAlerts = await Alert.countDocuments({ status: 'active' });

    const allPlans = await ProductionPlan.find({ date: { $gte: today } }).sort({ date: 1 }).limit(10);
    const normalCount = materials.filter(m => m.quantity > m.reorderLevel * 1.5).length;
    const warningCount = materials.filter(m => m.quantity > m.reorderLevel && m.quantity <= m.reorderLevel * 1.5).length;
    const criticalCount = materials.filter(m => m.quantity <= m.reorderLevel).length;

    res.json({
      kpis: { todayProduction, forecastedDemand, inventoryValue: Math.round(inventoryValue), lowStockItems, expiringBatches, activeAlerts },
      upcomingPlans: allPlans,
      inventoryDistribution: { normal: normalCount, warning: warningCount, critical: criticalCount },
      totalMaterials: materials.length
    });
  } catch (err) {
    res.json(DEMO_DASHBOARD);
  }
};

module.exports = { getDashboardStats };
