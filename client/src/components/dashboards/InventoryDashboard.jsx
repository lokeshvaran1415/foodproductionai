import { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const KPICard = ({ title, value, icon, color, subtitle, badge }) => (
  <div className="kpi-card" style={{ borderLeftColor: color }}>
    <div className="kpi-icon" style={{ background: color + '22', color }}>{icon}</div>
    <div className="kpi-content" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kpi-title">{title}</p>
        {badge && <span className="badge badge-outline" style={{ fontSize: '10px' }}>{badge}</span>}
      </div>
      <h3 className="kpi-value">{value}</h3>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function InventoryDashboard({ user }) {
  // Inventory status distribution pie data
  const pieData = [
    { name: 'Normal (5 SKUs)', value: 5 },
    { name: 'Warning (1 SKU)', value: 1 },
    { name: 'Critical (2 SKUs)', value: 2 },
  ];

  // Storage Zone Occupancy
  const storageZones = [
    { name: 'Cold Storage (Dairy & Butter)', used: 35, total: 40, pct: 88, temp: '3.5°C', alert: true },
    { name: 'Dry Ambient Store (Flour & Sugar)', used: 185, total: 250, pct: 74, temp: '22°C', alert: false },
    { name: 'Packaging & Additives Bay', used: 65, total: 100, pct: 65, temp: '21°C', alert: false },
    { name: 'Quarantine & Disposal Rack', used: 2, total: 10, pct: 20, temp: 'Isolated', alert: true },
  ];

  // Upcoming reorder table (SKUs below reorder point)
  const [reorders, setReorders] = useState([
    {
      id: 'r1',
      material: 'Milk',
      currentStock: '95 L',
      reorderPoint: '120 L',
      deficit: '-25 L',
      suggestedPO: '200 L',
      unitCost: '₹55',
      totalCost: '₹11,000',
      supplier: 'Fresh Dairy Farm',
      leadTime: '1 day',
      severity: 'critical',
      ordered: false
    },
    {
      id: 'r2',
      material: 'Butter',
      currentStock: '48 kg',
      reorderPoint: '60 kg',
      deficit: '-12 kg',
      suggestedPO: '50 kg',
      unitCost: '₹450',
      totalCost: '₹22,500',
      supplier: 'Amul Distributors',
      leadTime: '2 days',
      severity: 'critical',
      ordered: false
    },
    {
      id: 'r3',
      material: 'Cocoa Powder',
      currentStock: '75 kg',
      reorderPoint: '80 kg',
      deficit: '-5 kg',
      suggestedPO: '40 kg',
      unitCost: '₹320',
      totalCost: '₹12,800',
      supplier: 'Choco Imports',
      leadTime: '4 days',
      severity: 'warning',
      ordered: false
    }
  ]);

  // Critical Expiry Watchlist
  const [expiryList] = useState([
    { id: 'e1', material: 'Milk', batchCode: 'MK-2024-001', qty: '95 L', daysLeft: '2 days', status: 'expiring_soon', action: 'Prioritize for Dairy Line C run today' },
    { id: 'e2', material: 'Butter', batchCode: 'BT-2024-001', qty: '30 kg', daysLeft: '2 days', status: 'expiring_soon', action: 'Schedule for Bakery Line B early use' },
    { id: 'e3', material: 'Butter', batchCode: 'BT-2024-002', qty: '18 kg', daysLeft: 'EXPIRED', status: 'expired', action: 'Immediate quarantine & disposal required' },
  ]);

  const handleOrder = (id, material, po) => {
    setReorders(reorders.map(r => r.id === id ? { ...r, ordered: true } : r));
    toast.success(`Purchase order for ${po} of ${material} generated & sent to supplier!`);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="page-title">Inventory Control & Warehouse Logistics</h1>
            <span className="badge badge-warning" style={{ fontSize: '11px' }}>Inventory Manager: {user?.name || 'Vikram Singh'}</span>
          </div>
          <p className="page-subtitle">Raw material valuation, reorder thresholds, shelf-life monitoring & warehouse occupancy</p>
        </div>
        <div className="header-meta">
          <span className="badge badge-warning">3 Items Below Reorder</span>
          <span className="badge badge-danger">2 Batches Expiring</span>
          <span className="text-muted">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Inventory KPIs */}
      <div className="kpi-grid">
        <KPICard
          title="Total Inventory Value"
          value="₹118,375"
          icon="💰"
          color="#10b981"
          subtitle="Across 8 raw materials"
          badge="Stock Asset"
        />
        <KPICard
          title="Low Stock SKUs"
          value="3 below reorder"
          icon="⚠️"
          color="#ef4444"
          subtitle="Milk (95L), Butter (48kg), Cocoa (75kg)"
          badge="Immediate PO"
        />
        <KPICard
          title="Expiring Batches"
          value="2 within 3 days"
          icon="⏰"
          color="#f59e0b"
          subtitle="MK-2024-001 & BT-2024-001 (+1 Expired)"
          badge="Shelf-Life Risk"
        />
        <KPICard
          title="Warehouse Occupancy"
          value="78%"
          icon="📦"
          color="#6366f1"
          subtitle="312 / 400 pallets utilized"
          badge="Optimal <85%"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Inventory Status Distribution Pie Chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Inventory Status Distribution</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>8 Total SKUs</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Warehouse Zone Occupancy Breakdown */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Storage Zone Occupancy (78% Total)</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>312/400 Pallets</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
            {storageZones.map(zone => (
              <div key={zone.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{zone.name}</span>
                  <span style={{ color: zone.pct >= 85 ? '#ef4444' : zone.pct > 70 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                    {zone.used}/{zone.total} pallets ({zone.pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${zone.pct}%`,
                    height: '100%',
                    background: zone.pct >= 85 ? '#ef4444' : zone.pct > 70 ? '#f59e0b' : '#10b981',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Reorder Table */}
      <div className="section-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Upcoming Reorder Table (Stock Replenishment)</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Materials currently below safety threshold with AI suggested purchase orders</p>
          </div>
          <span className="badge badge-danger">3 Immediate Actions</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Raw Material</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
                <th>Deficit</th>
                <th>Suggested PO</th>
                <th>Supplier</th>
                <th>Estimated Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reorders.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.material}</td>
                  <td style={{ color: '#ef4444', fontWeight: 700 }}>{item.currentStock}</td>
                  <td>{item.reorderPoint}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 600 }}>{item.deficit}</td>
                  <td><span className="badge badge-info">{item.suggestedPO}</span></td>
                  <td>{item.supplier} ({item.leadTime})</td>
                  <td style={{ fontWeight: 600 }}>{item.totalCost}</td>
                  <td>
                    {item.ordered ? (
                      <span className="badge badge-success">✓ PO Sent</span>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 12px', fontSize: '11px', background: item.severity === 'critical' ? '#ef4444' : '#f59e0b' }}
                        onClick={() => handleOrder(item.id, item.material, item.suggestedPO)}
                      >
                        Reorder Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Expiry Watchlist Table */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Critical Expiry Watchlist (FEFO First-Expiry-First-Out)</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Active batches requiring immediate allocation or quarantine to prevent waste</p>
          </div>
          <span className="badge badge-warning">2 Within 3 Days • 1 Expired</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Days to Expiry</th>
                <th>Status</th>
                <th>Floor Handling Instruction</th>
              </tr>
            </thead>
            <tbody>
              {expiryList.map(batch => (
                <tr key={batch.id}>
                  <td><code>{batch.batchCode}</code></td>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{batch.material}</td>
                  <td>{batch.qty}</td>
                  <td style={{ color: batch.status === 'expired' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                    {batch.daysLeft}
                  </td>
                  <td>
                    <span className={`badge ${batch.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>
                      {batch.status === 'expired' ? 'EXPIRED' : 'Expiring Soon'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#cbd5e1' }}>{batch.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
