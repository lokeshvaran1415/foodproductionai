import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DEMO_PLANS = [
  { _id: '1', productName: 'Bread',       date: new Date().toISOString(), plannedQty: 875,  forecastDemand: 1125, currentInventory: 250, requiredProduction: 875,  productionLine: 'Line A', status: 'in_progress' },
  { _id: '2', productName: 'Biscuits',    date: new Date().toISOString(), plannedQty: 490,  forecastDemand: 672,  currentInventory: 182, requiredProduction: 490,  productionLine: 'Line B', status: 'planned' },
  { _id: '3', productName: 'Cake',        date: new Date().toISOString(), plannedQty: 215,  forecastDemand: 305,  currentInventory: 90,  requiredProduction: 215,  productionLine: 'Line A', status: 'planned' },
  { _id: '4', productName: 'Milk Packet', date: new Date().toISOString(), plannedQty: 1260, forecastDemand: 1580, currentInventory: 320, requiredProduction: 1260, productionLine: 'Line C', status: 'in_progress' },
  { _id: '5', productName: 'Yogurt',      date: new Date().toISOString(), plannedQty: 340,  forecastDemand: 478,  currentInventory: 140, requiredProduction: 338,  productionLine: 'Line C', status: 'planned' },
];

const STATUS_COLORS = { planned: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger' };

export default function ProductionPlanning() {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ productId: '', date: new Date().toISOString().split('T')[0], plannedQty: '', productionLine: 'Line A', notes: '' });

  useEffect(() => {
    Promise.all([api.get('/production'), api.get('/products')])
      .then(([pRes, prRes]) => {
        setPlans(pRes.data.length > 0 ? pRes.data : DEMO_PLANS);
        setProducts(prRes.data);
      })
      .catch(() => { setPlans(DEMO_PLANS); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/production', { ...form, plannedQty: Number(form.plannedQty) });
      setPlans([res.data, ...plans]);
      setShowModal(false);
      toast.success('Production plan created!');
    } catch {
      toast.error('Failed to create plan (Demo: DB may not be running)');
      // Add demo plan anyway
      const demoPlan = {
        _id: Date.now().toString(),
        productName: products.find(p => p._id === form.productId)?.name || 'Product',
        date: form.date,
        plannedQty: Number(form.plannedQty),
        forecastDemand: Number(form.plannedQty),
        currentInventory: 0,
        requiredProduction: Number(form.plannedQty),
        productionLine: form.productionLine,
        status: 'planned'
      };
      setPlans([demoPlan, ...plans]);
      setShowModal(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/production/${id}`, { status });
    } catch {}
    setPlans(plans.map(p => p._id === id ? { ...p, status } : p));
    toast.success('Status updated!');
  };

  if (loading) return <div className="page-loading">Loading production plans...</div>;

  const today = plans.filter(p => new Date(p.date).toDateString() === new Date().toDateString());
  const totalPlanned = plans.reduce((s, p) => s + (p.plannedQty || 0), 0);
  const totalRequired = plans.reduce((s, p) => s + (p.requiredProduction || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏭 Production Planning</h1>
          <p className="page-subtitle">Schedule and manage production runs based on demand forecasts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Plan</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Plans</span><strong>{plans.length}</strong>
        </div>
        <div className="summary-card">
          <span>In Progress</span><strong style={{ color: '#f59e0b' }}>{plans.filter(p => p.status === 'in_progress').length}</strong>
        </div>
        <div className="summary-card">
          <span>Planned</span><strong style={{ color: '#6366f1' }}>{plans.filter(p => p.status === 'planned').length}</strong>
        </div>
        <div className="summary-card">
          <span>Completed</span><strong style={{ color: '#10b981' }}>{plans.filter(p => p.status === 'completed').length}</strong>
        </div>
        <div className="summary-card">
          <span>Total Planned Qty</span><strong>{totalPlanned.toLocaleString()}</strong>
        </div>
      </div>

      {/* Plans Table */}
      <div className="section-card">
        <h3 className="section-title">All Production Plans</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Date</th>
                <th>Forecast Demand</th>
                <th>Current Inventory</th>
                <th>Required Production</th>
                <th>Planned Qty</th>
                <th>Line</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => {
                const gap = (plan.forecastDemand || 0) - (plan.plannedQty || 0);
                return (
                  <tr key={plan._id}>
                    <td><strong>{plan.productName || plan.productId?.name}</strong></td>
                    <td>{new Date(plan.date).toLocaleDateString('en-IN')}</td>
                    <td>{plan.forecastDemand?.toLocaleString()}</td>
                    <td>{plan.currentInventory?.toLocaleString()}</td>
                    <td>
                      <span style={{ color: plan.requiredProduction > plan.plannedQty ? '#ef4444' : '#10b981' }}>
                        {plan.requiredProduction?.toLocaleString()}
                      </span>
                    </td>
                    <td>{plan.plannedQty?.toLocaleString()}</td>
                    <td><span className="badge badge-info">{plan.productionLine}</span></td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[plan.status] || 'info'}`}>
                        {plan.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {plan.status === 'planned' && (
                        <button className="btn-sm btn-warning" onClick={() => updateStatus(plan._id, 'in_progress')}>Start</button>
                      )}
                      {plan.status === 'in_progress' && (
                        <button className="btn-sm btn-success" onClick={() => updateStatus(plan._id, 'completed')}>Complete</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create Production Plan</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Product</label>
                <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Planned Quantity</label>
                <input type="number" value={form.plannedQty} onChange={e => setForm({ ...form, plannedQty: e.target.value })} placeholder="e.g. 500" required />
              </div>
              <div className="form-group">
                <label>Production Line</label>
                <select value={form.productionLine} onChange={e => setForm({ ...form, productionLine: e.target.value })}>
                  <option>Line A</option>
                  <option>Line B</option>
                  <option>Line C</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
