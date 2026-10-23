const DEMO_PLANS = [
  { _id: '1', productName: 'Bread',       date: new Date(), plannedQty: 875,  forecastDemand: 1125, currentInventory: 250, requiredProduction: 875,  productionLine: 'Line A', status: 'in_progress', notes: '' },
  { _id: '2', productName: 'Biscuits',    date: new Date(), plannedQty: 490,  forecastDemand: 672,  currentInventory: 182, requiredProduction: 490,  productionLine: 'Line B', status: 'planned',     notes: '' },
  { _id: '3', productName: 'Cake',        date: new Date(), plannedQty: 215,  forecastDemand: 305,  currentInventory: 90,  requiredProduction: 215,  productionLine: 'Line A', status: 'planned',     notes: '' },
  { _id: '4', productName: 'Milk Packet', date: new Date(), plannedQty: 1260, forecastDemand: 1580, currentInventory: 320, requiredProduction: 1260, productionLine: 'Line C', status: 'in_progress', notes: '' },
  { _id: '5', productName: 'Yogurt',      date: new Date(), plannedQty: 340,  forecastDemand: 478,  currentInventory: 140, requiredProduction: 338,  productionLine: 'Line C', status: 'planned',     notes: '' },
  { _id: '6', productName: 'Bread',       date: new Date(Date.now()-86400000), plannedQty: 900, forecastDemand: 1095, currentInventory: 200, requiredProduction: 895, productionLine: 'Line A', status: 'completed', notes: '' },
  { _id: '7', productName: 'Biscuits',    date: new Date(Date.now()-86400000), plannedQty: 500, forecastDemand: 655, currentInventory: 155, requiredProduction: 500, productionLine: 'Line B', status: 'completed', notes: '' }
];

let demoPlanStore = [...DEMO_PLANS];

const getAllPlans = async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(demoPlanStore);
  try {
    const ProductionPlan = require('../models/ProductionPlan');
    const plans = await ProductionPlan.find().sort({ date: -1 });
    res.json(plans);
  } catch { res.json(demoPlanStore); }
};

const getPlanById = async (req, res) => {
  if (!global.DB_CONNECTED) {
    const plan = demoPlanStore.find(p => p._id === req.params.id);
    return plan ? res.json(plan) : res.status(404).json({ message: 'Plan not found' });
  }
  try {
    const ProductionPlan = require('../models/ProductionPlan');
    const plan = await ProductionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch { res.status(500).json({ message: 'Error' }); }
};

const createPlan = async (req, res) => {
  if (!global.DB_CONNECTED) {
    const newPlan = { _id: Date.now().toString(), ...req.body, status: 'planned' };
    demoPlanStore.unshift(newPlan);
    return res.status(201).json(newPlan);
  }
  try {
    const ProductionPlan = require('../models/ProductionPlan');
    const Product = require('../models/Product');
    const DemandForecast = require('../models/DemandForecast');
    const { productId, date, plannedQty, productionLine, notes } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const forecast = await DemandForecast.findOne({ productId }).sort({ date: -1 });
    const forecastDemand = forecast ? forecast.predictedQty : plannedQty;
    const currentInventory = product.currentStock || 0;
    const requiredProduction = Math.max(0, forecastDemand - currentInventory);
    const plan = await ProductionPlan.create({ productId, productName: product.name, date: new Date(date), plannedQty, forecastDemand, currentInventory, requiredProduction, productionLine: productionLine || 'Line A', notes: notes || '' });
    res.status(201).json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updatePlan = async (req, res) => {
  if (!global.DB_CONNECTED) {
    demoPlanStore = demoPlanStore.map(p => p._id === req.params.id ? { ...p, ...req.body } : p);
    const updated = demoPlanStore.find(p => p._id === req.params.id);
    return res.json(updated || { message: 'Updated' });
  }
  try {
    const ProductionPlan = require('../models/ProductionPlan');
    const plan = await ProductionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deletePlan = async (req, res) => {
  if (!global.DB_CONNECTED) {
    demoPlanStore = demoPlanStore.filter(p => p._id !== req.params.id);
    return res.json({ message: 'Plan deleted' });
  }
  try {
    const ProductionPlan = require('../models/ProductionPlan');
    await ProductionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllPlans, getPlanById, createPlan, updatePlan, deletePlan };
