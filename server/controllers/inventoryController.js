const DEMO_MATERIALS = [
  { _id: 'm1', name: 'Wheat Flour',  unit: 'kg',  quantity: 850,  reorderLevel: 300, shelfLifeDays: 180, costPerUnit: 35,  supplier: 'Agro Mills Ltd',    status: 'normal' },
  { _id: 'm2', name: 'Sugar',        unit: 'kg',  quantity: 420,  reorderLevel: 150, shelfLifeDays: 365, costPerUnit: 45,  supplier: 'Sweet Supply Co',   status: 'normal' },
  { _id: 'm3', name: 'Milk',         unit: 'L',   quantity: 95,   reorderLevel: 120, shelfLifeDays: 5,   costPerUnit: 55,  supplier: 'Fresh Dairy Farm',  status: 'low_stock' },
  { _id: 'm4', name: 'Butter',       unit: 'kg',  quantity: 48,   reorderLevel: 60,  shelfLifeDays: 30,  costPerUnit: 450, supplier: 'Amul Distributors', status: 'low_stock' },
  { _id: 'm5', name: 'Eggs',         unit: 'pcs', quantity: 1200, reorderLevel: 500, shelfLifeDays: 21,  costPerUnit: 8,   supplier: 'Poultry Direct',    status: 'normal' },
  { _id: 'm6', name: 'Cocoa Powder', unit: 'kg',  quantity: 75,   reorderLevel: 80,  shelfLifeDays: 365, costPerUnit: 320, supplier: 'Choco Imports',     status: 'low_stock' },
  { _id: 'm7', name: 'Yeast',        unit: 'kg',  quantity: 35,   reorderLevel: 20,  shelfLifeDays: 90,  costPerUnit: 180, supplier: 'BioTech Supplies',  status: 'normal' },
  { _id: 'm8', name: 'Salt',         unit: 'kg',  quantity: 200,  reorderLevel: 50,  shelfLifeDays: 1825,costPerUnit: 15,  supplier: 'Salt Works India',  status: 'normal' }
];

const DEMO_BATCHES = [
  { _id: 'b1', materialName: 'Wheat Flour',  batchCode: 'FL-2024-001', quantity: 500, unit: 'kg',  receivedDate: new Date(Date.now()-10*86400000), expiryDate: new Date(Date.now()+170*86400000), daysLeft: 170, status: 'normal' },
  { _id: 'b2', materialName: 'Wheat Flour',  batchCode: 'FL-2024-002', quantity: 350, unit: 'kg',  receivedDate: new Date(Date.now()-5*86400000),  expiryDate: new Date(Date.now()+175*86400000), daysLeft: 175, status: 'normal' },
  { _id: 'b3', materialName: 'Sugar',        batchCode: 'SG-2024-001', quantity: 420, unit: 'kg',  receivedDate: new Date(Date.now()-20*86400000), expiryDate: new Date(Date.now()+340*86400000), daysLeft: 340, status: 'normal' },
  { _id: 'b4', materialName: 'Milk',         batchCode: 'MK-2024-001', quantity: 95,  unit: 'L',   receivedDate: new Date(Date.now()-2*86400000),  expiryDate: new Date(Date.now()+2*86400000),   daysLeft: 2,   status: 'expiring_soon' },
  { _id: 'b5', materialName: 'Butter',       batchCode: 'BT-2024-001', quantity: 30,  unit: 'kg',  receivedDate: new Date(Date.now()-25*86400000), expiryDate: new Date(Date.now()+2*86400000),   daysLeft: 2,   status: 'expiring_soon' },
  { _id: 'b6', materialName: 'Butter',       batchCode: 'BT-2024-002', quantity: 18,  unit: 'kg',  receivedDate: new Date(Date.now()-30*86400000), expiryDate: new Date(Date.now()-86400000),     daysLeft: -1,  status: 'expired' },
  { _id: 'b7', materialName: 'Eggs',         batchCode: 'EG-2024-001', quantity: 1200,unit: 'pcs', receivedDate: new Date(Date.now()-3*86400000),  expiryDate: new Date(Date.now()+18*86400000),  daysLeft: 18,  status: 'normal' },
  { _id: 'b8', materialName: 'Cocoa Powder', batchCode: 'CC-2024-001', quantity: 75,  unit: 'kg',  receivedDate: new Date(Date.now()-15*86400000), expiryDate: new Date(Date.now()+350*86400000), daysLeft: 350, status: 'normal' },
  { _id: 'b9', materialName: 'Yeast',        batchCode: 'YS-2024-001', quantity: 35,  unit: 'kg',  receivedDate: new Date(Date.now()-7*86400000),  expiryDate: new Date(Date.now()+83*86400000),  daysLeft: 83,  status: 'normal' },
  { _id: 'b10',materialName: 'Salt',         batchCode: 'SL-2024-001', quantity: 200, unit: 'kg',  receivedDate: new Date(Date.now()-60*86400000), expiryDate: new Date(Date.now()+1765*86400000),daysLeft: 1765,status: 'normal' }
];

let demoMaterialStore = [...DEMO_MATERIALS];
let demoBatchStore = [...DEMO_BATCHES];

const getMaterials = async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(demoMaterialStore);
  try {
    const RawMaterial = require('../models/RawMaterial');
    const materials = await RawMaterial.find().sort({ name: 1 });
    const annotated = materials.map(m => {
      let status = 'normal';
      if (m.quantity <= 0) status = 'stockout';
      else if (m.quantity <= m.reorderLevel) status = 'low_stock';
      else if (m.quantity <= m.reorderLevel * 1.5) status = 'warning';
      return { ...m.toObject(), status };
    });
    res.json(annotated);
  } catch { res.json(demoMaterialStore); }
};

const updateMaterial = async (req, res) => {
  if (!global.DB_CONNECTED) {
    demoMaterialStore = demoMaterialStore.map(m => m._id === req.params.id ? { ...m, ...req.body } : m);
    return res.json(demoMaterialStore.find(m => m._id === req.params.id));
  }
  try {
    const RawMaterial = require('../models/RawMaterial');
    const material = await RawMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getBatches = async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(demoBatchStore);
  try {
    const InventoryBatch = require('../models/InventoryBatch');
    const today = new Date();
    const batches = await InventoryBatch.find().sort({ expiryDate: 1 }).populate('materialId', 'name unit');
    const annotated = batches.map(b => {
      const daysLeft = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
      let status = 'normal';
      if (daysLeft <= 0) status = 'expired';
      else if (daysLeft <= 3) status = 'expiring_soon';
      else if (daysLeft <= 7) status = 'warning';
      return { ...b.toObject(), daysLeft, status };
    });
    res.json(annotated);
  } catch { res.json(demoBatchStore); }
};

const addBatch = async (req, res) => {
  if (!global.DB_CONNECTED) {
    const newBatch = { _id: Date.now().toString(), ...req.body, daysLeft: 30, status: 'normal' };
    demoBatchStore.push(newBatch);
    return res.status(201).json(newBatch);
  }
  try {
    const InventoryBatch = require('../models/InventoryBatch');
    const RawMaterial = require('../models/RawMaterial');
    const material = await RawMaterial.findById(req.body.materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    const batch = await InventoryBatch.create({ ...req.body, materialName: material.name, unit: material.unit });
    material.quantity += req.body.quantity;
    await material.save();
    res.status(201).json(batch);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getExpiringBatches = async (req, res) => {
  if (!global.DB_CONNECTED) {
    return res.json(demoBatchStore.filter(b => b.daysLeft <= 7));
  }
  try {
    const InventoryBatch = require('../models/InventoryBatch');
    const today = new Date();
    const sevenDays = new Date(today); sevenDays.setDate(sevenDays.getDate() + 7);
    const batches = await InventoryBatch.find({ expiryDate: { $lte: sevenDays } }).sort({ expiryDate: 1 }).populate('materialId', 'name');
    const annotated = batches.map(b => {
      const daysLeft = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
      return { ...b.toObject(), daysLeft, status: daysLeft <= 0 ? 'expired' : daysLeft <= 3 ? 'expiring_soon' : 'warning' };
    });
    res.json(annotated);
  } catch { res.json(demoBatchStore.filter(b => b.daysLeft <= 7)); }
};

module.exports = { getMaterials, updateMaterial, getBatches, addBatch, getExpiringBatches };
