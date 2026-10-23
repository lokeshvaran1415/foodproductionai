const DEMO_ALERTS_DATA = [
  { _id: 'a1', type: 'low_stock',       severity: 'critical', message: 'Milk inventory has fallen below reorder level.',            detail: 'Current: 95 L | Reorder Level: 120 L | Supplier: Fresh Dairy Farm',               status: 'active',       createdAt: new Date(Date.now()-2*3600000) },
  { _id: 'a2', type: 'low_stock',       severity: 'warning',  message: 'Butter inventory is critically low.',                       detail: 'Current: 48 kg | Reorder Level: 60 kg | Supplier: Amul Distributors',              status: 'active',       createdAt: new Date(Date.now()-3*3600000) },
  { _id: 'a3', type: 'low_stock',       severity: 'warning',  message: 'Cocoa Powder is approaching reorder level.',                detail: 'Current: 75 kg | Reorder Level: 80 kg',                                            status: 'active',       createdAt: new Date(Date.now()-4*3600000) },
  { _id: 'a4', type: 'expiry',          severity: 'warning',  message: 'Milk batch MK-2024-001 expires in 2 days.',                 detail: 'Batch: MK-2024-001 | Qty: 95 L | Immediate action needed.',                        status: 'active',       createdAt: new Date(Date.now()-1*3600000) },
  { _id: 'a5', type: 'expiry',          severity: 'warning',  message: 'Butter batch BT-2024-001 expires in 2 days.',               detail: 'Batch: BT-2024-001 | Qty: 30 kg | Schedule for early use.',                        status: 'active',       createdAt: new Date(Date.now()-1*3600000) },
  { _id: 'a6', type: 'expiry',          severity: 'critical', message: 'Butter batch BT-2024-002 has EXPIRED.',                     detail: 'Batch: BT-2024-002 | Qty: 18 kg — Immediate disposal required.',                    status: 'active',       createdAt: new Date(Date.now()-30*60000) },
  { _id: 'a7', type: 'demand_spike',    severity: 'info',     message: 'Projected demand for Bread increased by 15% vs last week.', detail: 'Previous forecast: 980 units | New forecast: 1125 units (+14.8%)',                  status: 'active',       createdAt: new Date(Date.now()-6*3600000) },
  { _id: 'a8', type: 'production_risk', severity: 'warning',  message: 'Milk Packet production plan may not satisfy forecasted demand.', detail: 'Planned: 1260 packets | Forecast: 1580 packets | Shortfall: 320 packets',      status: 'active',       createdAt: new Date(Date.now()-5*3600000) },
  { _id: 'a9', type: 'stockout',        severity: 'info',     message: 'Yogurt production shortfall detected.',                     detail: 'At current rate, Yogurt stock may reach zero in 3 days without replenishment.',    status: 'acknowledged', createdAt: new Date(Date.now()-8*3600000) }
];

let demoAlertStore = [...DEMO_ALERTS_DATA];

const getAlerts = async (req, res) => {
  if (!global.DB_CONNECTED) {
    const { status, severity } = req.query;
    let result = demoAlertStore;
    if (status) result = result.filter(a => a.status === status);
    if (severity) result = result.filter(a => a.severity === severity);
    return res.json(result);
  }
  try {
    const Alert = require('../models/Alert');
    const { status, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch { res.json(demoAlertStore); }
};

const resolveAlert = async (req, res) => {
  if (!global.DB_CONNECTED) {
    demoAlertStore = demoAlertStore.map(a => a._id === req.params.id ? { ...a, status: 'resolved', resolvedAt: new Date() } : a);
    return res.json(demoAlertStore.find(a => a._id === req.params.id));
  }
  try {
    const Alert = require('../models/Alert');
    const alert = await Alert.findByIdAndUpdate(req.params.id, { status: 'resolved', resolvedAt: new Date() }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const acknowledgeAlert = async (req, res) => {
  if (!global.DB_CONNECTED) {
    demoAlertStore = demoAlertStore.map(a => a._id === req.params.id ? { ...a, status: 'acknowledged' } : a);
    return res.json(demoAlertStore.find(a => a._id === req.params.id));
  }
  try {
    const Alert = require('../models/Alert');
    const alert = await Alert.findByIdAndUpdate(req.params.id, { status: 'acknowledged' }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const generateAlerts = async (req, res) => {
  if (!global.DB_CONNECTED) {
    return res.json({ generated: 0, alerts: demoAlertStore.filter(a => a.status === 'active'), message: 'Demo mode: showing existing alerts' });
  }
  try {
    const Alert = require('../models/Alert');
    const RawMaterial = require('../models/RawMaterial');
    const InventoryBatch = require('../models/InventoryBatch');
    const newAlerts = [];
    const today = new Date();
    const materials = await RawMaterial.find();
    for (const m of materials) {
      if (m.quantity <= m.reorderLevel) {
        const exists = await Alert.findOne({ type: 'low_stock', relatedId: m._id, status: 'active' });
        if (!exists) newAlerts.push({ type: 'low_stock', severity: m.quantity <= 0 ? 'critical' : 'warning', message: `${m.name} inventory has fallen below reorder level.`, detail: `Current: ${m.quantity} ${m.unit} | Reorder Level: ${m.reorderLevel} ${m.unit}`, relatedId: m._id, relatedModel: 'RawMaterial' });
      }
    }
    const threeDays = new Date(today); threeDays.setDate(threeDays.getDate() + 3);
    const expiringBatches = await InventoryBatch.find({ expiryDate: { $lte: threeDays } }).populate('materialId', 'name');
    for (const b of expiringBatches) {
      const daysLeft = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
      const exists = await Alert.findOne({ type: 'expiry', relatedId: b._id, status: 'active' });
      if (!exists) newAlerts.push({ type: 'expiry', severity: daysLeft <= 0 ? 'critical' : 'warning', message: daysLeft <= 0 ? `${b.materialName} batch (${b.batchCode}) has EXPIRED.` : `${b.materialName} batch (${b.batchCode}) expires in ${daysLeft} day(s).`, detail: `Batch: ${b.batchCode} | Qty: ${b.quantity} ${b.unit}`, relatedId: b._id, relatedModel: 'InventoryBatch' });
    }
    if (newAlerts.length > 0) await Alert.insertMany(newAlerts);
    const allActive = await Alert.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ generated: newAlerts.length, alerts: allActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAlerts, resolveAlert, acknowledgeAlert, generateAlerts };
