import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

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
  { _id: 'b6', materialName: 'Butter',       batchCode: 'BT-2024-002', quantity: 18,  unit: 'kg',  receivedDate: new Date(Date.now()-30*86400000), expiryDate: new Date(Date.now()-1*86400000),   daysLeft: -1,  status: 'expired' },
  { _id: 'b7', materialName: 'Eggs',         batchCode: 'EG-2024-001', quantity: 1200,unit: 'pcs', receivedDate: new Date(Date.now()-3*86400000),  expiryDate: new Date(Date.now()+18*86400000),  daysLeft: 18,  status: 'normal' },
  { _id: 'b8', materialName: 'Cocoa Powder', batchCode: 'CC-2024-001', quantity: 75,  unit: 'kg',  receivedDate: new Date(Date.now()-15*86400000), expiryDate: new Date(Date.now()+350*86400000), daysLeft: 350, status: 'normal' },
];

const STATUS_CONFIG = {
  normal:        { label: 'Normal',         class: 'badge-success' },
  warning:       { label: 'Warning',        class: 'badge-warning' },
  low_stock:     { label: 'Low Stock',      class: 'badge-danger' },
  stockout:      { label: 'Stockout',       class: 'badge-danger' },
  expiring_soon: { label: 'Expiring Soon',  class: 'badge-warning' },
  expired:       { label: 'EXPIRED',        class: 'badge-danger' }
};

export default function Inventory({ defaultTab = 'materials' }) {
  const [tab, setTab] = useState(defaultTab);
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQty, setEditingQty] = useState(null);
  const [newQty, setNewQty] = useState('');

  useEffect(() => {
    Promise.all([api.get('/inventory/materials'), api.get('/inventory/batches')])
      .then(([mRes, bRes]) => {
        setMaterials(mRes.data.length > 0 ? mRes.data : DEMO_MATERIALS);
        setBatches(bRes.data.length > 0 ? bRes.data : DEMO_BATCHES);
      })
      .catch(() => { setMaterials(DEMO_MATERIALS); setBatches(DEMO_BATCHES); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateQty = async (id) => {
    try {
      await api.put(`/inventory/materials/${id}`, { quantity: Number(newQty) });
    } catch {}
    setMaterials(materials.map(m => m._id === id ? { ...m, quantity: Number(newQty) } : m));
    setEditingQty(null);
    toast.success('Quantity updated!');
  };

  if (loading) return <div className="page-loading">Loading inventory...</div>;

  const lowStockCount = materials.filter(m => m.status === 'low_stock' || m.status === 'stockout').length;
  const expiringCount = batches.filter(b => b.status === 'expiring_soon').length;
  const expiredCount = batches.filter(b => b.status === 'expired').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Inventory Management</h1>
          <p className="page-subtitle">Track raw materials, batches, and expiry status</p>
        </div>
        <div className="header-badges">
          {lowStockCount > 0 && <span className="badge badge-danger">⚠ {lowStockCount} Low Stock</span>}
          {expiringCount > 0 && <span className="badge badge-warning">⏰ {expiringCount} Expiring Soon</span>}
          {expiredCount > 0 && <span className="badge badge-danger">💀 {expiredCount} Expired</span>}
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'materials' ? 'active' : ''}`} onClick={() => setTab('materials')}>Raw Materials</button>
        <button className={`tab-btn ${tab === 'batches' ? 'active' : ''}`} onClick={() => setTab('batches')}>Inventory Batches & Expiry</button>
      </div>

      {tab === 'materials' && (
        <div className="section-card">
          <h3 className="section-title">Raw Material Stock Levels</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Available Qty</th>
                  <th>Unit</th>
                  <th>Reorder Level</th>
                  <th>Stock %</th>
                  <th>Cost/Unit</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(m => {
                  const pct = Math.min(100, Math.round((m.quantity / (m.reorderLevel * 3)) * 100));
                  const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.normal;
                  return (
                    <tr key={m._id}>
                      <td><strong>{m.name}</strong></td>
                      <td>
                        {editingQty === m._id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} style={{ width: 80, padding: '2px 6px', background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 4 }} />
                            <button className="btn-sm btn-success" onClick={() => handleUpdateQty(m._id)}>✓</button>
                          </div>
                        ) : m.quantity.toLocaleString()}
                      </td>
                      <td>{m.unit}</td>
                      <td>{m.reorderLevel.toLocaleString()}</td>
                      <td>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar" style={{ width: pct + '%', background: pct < 33 ? '#ef4444' : pct < 66 ? '#f59e0b' : '#10b981' }}></div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                      <td>₹{m.costPerUnit}</td>
                      <td>{m.supplier}</td>
                      <td><span className={`badge ${cfg.class}`}>{cfg.label}</span></td>
                      <td>
                        <button className="btn-sm btn-info" onClick={() => { setEditingQty(m._id); setNewQty(m.quantity); }}>Edit Qty</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'batches' && (
        <div className="section-card">
          <h3 className="section-title">Inventory Batches — Expiry Tracking</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Received Date</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.normal;
                  return (
                    <tr key={b._id} style={{ background: b.status === 'expired' ? 'rgba(239,68,68,0.08)' : b.status === 'expiring_soon' ? 'rgba(245,158,11,0.08)' : '' }}>
                      <td><code style={{ color: '#94a3b8' }}>{b.batchCode}</code></td>
                      <td><strong>{b.materialName || b.materialId?.name}</strong></td>
                      <td>{b.quantity.toLocaleString()} {b.unit}</td>
                      <td>{new Date(b.receivedDate).toLocaleDateString('en-IN')}</td>
                      <td>{new Date(b.expiryDate).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span style={{ color: b.daysLeft <= 0 ? '#ef4444' : b.daysLeft <= 3 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                          {b.daysLeft <= 0 ? 'EXPIRED' : `${b.daysLeft} day${b.daysLeft !== 1 ? 's' : ''}`}
                        </span>
                      </td>
                      <td><span className={`badge ${cfg.class}`}>{cfg.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
