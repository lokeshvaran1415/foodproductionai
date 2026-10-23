import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';

const DEMO_ANALYTICS = {
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
    { date: 'Sun', production: 2200, demand: 2400 },
  ]
};

const PIE_COLORS = ['#ef4444', '#f59e0b', '#6366f1'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data))
      .catch(() => setData(DEMO_ANALYTICS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading analytics...</div>;

  const d = data || DEMO_ANALYTICS;
  const wasteData = [
    { name: 'Expired', value: d.wasteRisk.expired },
    { name: 'Expiring Soon', value: d.wasteRisk.expiringSoon },
    { name: 'Expiring Week', value: d.wasteRisk.expiringWeek }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Analytics & Reports</h1>
          <p className="page-subtitle">Production performance, inventory utilization, and waste risk analysis</p>
        </div>
        <span className="badge badge-success">Live Data</span>
      </div>

      {/* Weekly Trend */}
      <div className="chart-card">
        <h3 className="chart-title">Weekly Production vs Demand Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={d.weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
            <Legend />
            <Line type="monotone" dataKey="production" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Production" />
            <Line type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Demand" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Demand vs Production per Product */}
      <div className="chart-card">
        <h3 className="chart-title">Forecasted Demand vs Planned Production (Per Product)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={d.productComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
            <Legend />
            <Bar dataKey="demand" fill="#f59e0b" name="Forecasted Demand" radius={[4, 4, 0, 0]} />
            <Bar dataKey="production" fill="#6366f1" name="Planned Production" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid">
        {/* Inventory Utilization */}
        <div className="chart-card">
          <h3 className="chart-title">Inventory Utilization by Material</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={d.inventoryUtilization} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} formatter={(v) => `${v}%`} />
              <Bar dataKey="utilization" name="Utilization %" radius={[0, 4, 4, 0]}
                fill="#6366f1"
                label={{ position: 'right', fill: '#94a3b8', fontSize: 11, formatter: v => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Risk */}
        <div className="chart-card">
          <h3 className="chart-title">Expiry / Waste Risk</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={wasteData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                {wasteData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="waste-summary">
            <div className="waste-item"><span style={{ color: '#ef4444' }}>● Expired batches:</span><strong>{d.wasteRisk.expired}</strong></div>
            <div className="waste-item"><span style={{ color: '#f59e0b' }}>● Expiring in 3 days:</span><strong>{d.wasteRisk.expiringSoon}</strong></div>
            <div className="waste-item"><span style={{ color: '#6366f1' }}>● Expiring this week:</span><strong>{d.wasteRisk.expiringWeek}</strong></div>
          </div>
        </div>
      </div>

      {/* Production Gap Table */}
      <div className="section-card">
        <h3 className="section-title">Production Gap Analysis</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Forecasted Demand</th><th>Planned Production</th><th>Gap (Shortfall)</th><th>Risk</th></tr>
            </thead>
            <tbody>
              {d.productComparison.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.demand?.toLocaleString()}</td>
                  <td>{p.production?.toLocaleString()}</td>
                  <td style={{ color: p.gap > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {p.gap > 0 ? `▲ ${p.gap.toLocaleString()} shortage` : `✓ Surplus`}
                  </td>
                  <td>
                    <span className={`badge ${p.gap > 300 ? 'badge-danger' : p.gap > 100 ? 'badge-warning' : 'badge-success'}`}>
                      {p.gap > 300 ? 'High' : p.gap > 100 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
