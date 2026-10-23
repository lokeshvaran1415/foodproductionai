import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
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

const BAR_COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];

export default function PlannerDashboard({ user }) {
  // 7-Day Demand vs Production Forecast Curve
  const forecastCurve = [
    { day: 'Day 1 (Mon)', demand: 580, production: 560 },
    { day: 'Day 2 (Tue)', demand: 620, production: 600 },
    { day: 'Day 3 (Wed)', demand: 590, production: 610 },
    { day: 'Day 4 (Thu)', demand: 640, production: 620 },
    { day: 'Day 5 (Fri)', demand: 710, production: 680 },
    { day: 'Day 6 (Sat)', demand: 540, production: 530 },
    { day: 'Day 7 (Sun)', demand: 480, production: 490 },
  ];

  // SKU category demand distribution
  const skuDistribution = [
    { name: 'Milk Packet', category: 'Dairy', demand: 1580, share: '38.0%', unit: 'packets' },
    { name: 'Bread', category: 'Bakery', demand: 1125, share: '27.0%', unit: 'loaves' },
    { name: 'Biscuits', category: 'Bakery', demand: 672, share: '16.2%', unit: 'packs' },
    { name: 'Yogurt', category: 'Dairy', demand: 478, share: '11.5%', unit: 'cups' },
    { name: 'Cake', category: 'Bakery', demand: 305, share: '7.3%', unit: 'units' },
  ];

  // AI Demand Surge Anomalies
  const [anomalies, setAnomalies] = useState([
    {
      id: 'a1',
      product: 'Bread (Loaves)',
      type: 'Demand Surge',
      variance: '+14.8%',
      confidence: 91,
      factor: 'Local holiday weekend retail spike + bulk supermarket orders',
      recommendation: 'Increase Line A shift 2 planned quantity by +150 loaves',
      applied: false
    },
    {
      id: 'a2',
      product: 'Milk Packet (1L)',
      type: 'Demand Spike',
      variance: '+11.2%',
      confidence: 93,
      factor: 'Dairy co-op seasonal consumer promotion event',
      recommendation: 'Adjust planned run from 1,260 to 1,400 packets to prevent stockout',
      applied: false
    }
  ]);

  const handleApplyRecommendation = (id) => {
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, applied: true } : a));
    toast.success('Production plan adjustment recommendation sent to Line Manager!');
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="page-title">Demand Forecasting & Market Intelligence</h1>
            <span className="badge badge-info" style={{ fontSize: '11px' }}>Demand Planner: {user?.name || 'Ananya Iyer'}</span>
          </div>
          <p className="page-subtitle">Predictive ML forecasts, consumption velocity, seasonal anomaly detection & production alignment</p>
        </div>
        <div className="header-meta">
          <span className="badge badge-success">● AI Engine Active</span>
          <span className="badge badge-warning">2 Anomalies Detected</span>
          <span className="text-muted">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Demand Planner KPIs */}
      <div className="kpi-grid">
        <KPICard
          title="7-Day Demand"
          value="4,160 units"
          icon="📈"
          color="#0ea5e9"
          subtitle="Aggregated across 5 food SKUs"
          badge="7-Day Horizon"
        />
        <KPICard
          title="AI Confidence Rate"
          value="94.8%"
          icon="🤖"
          color="#6366f1"
          subtitle="Model: WMA + Trend Ensemble"
          badge="MAPE 4.2%"
        />
        <KPICard
          title="Demand Surge Anomalies"
          value="2 detected"
          icon="⚡"
          color="#f59e0b"
          subtitle="Bread (+14.8%) & Milk (+11.2%)"
          badge="Attention"
        />
        <KPICard
          title="30-Day Projections"
          value="18,450 units"
          icon="📊"
          color="#10b981"
          subtitle="+8.2% projected MoM expansion"
          badge="Monthly Outlook"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* 7-Day Demand vs Production Forecast Curve */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>7-Day Demand vs Production Forecast Curve</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Units / Day</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={forecastCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[400, 800]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="demand" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 4 }} name="Forecasted Demand" />
              <Line type="monotone" dataKey="production" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 4 }} name="Planned Production" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* SKU Category Demand Distribution */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>SKU Category Demand Distribution</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total: 4,160 units</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skuDistribution} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} />
              <Tooltip
                formatter={(val, name, item) => [`${val} ${item.payload.unit} (${item.payload.share})`, 'Forecast Demand']}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                {skuDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Demand Surge Anomalies Table */}
      <div className="section-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>AI Detected Demand Surge Anomalies</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Anomalous consumption deviations compared against 4-week trailing baseline</p>
          </div>
          <span className="badge badge-warning">2 Actionable Signals</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Anomaly Pattern</th>
                <th>Variance</th>
                <th>AI Confidence</th>
                <th>Market Driver / Factor</th>
                <th>Planning Recommendation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.product}</td>
                  <td>
                    <span className="badge badge-warning">⚡ {item.type}</span>
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 700 }}>{item.variance}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{item.confidence}%</span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{item.factor}</td>
                  <td style={{ fontSize: '12px', color: '#cbd5e1' }}>{item.recommendation}</td>
                  <td>
                    {item.applied ? (
                      <span className="badge badge-success">✓ Sent to Line</span>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 10px', fontSize: '11px', background: '#0ea5e9' }}
                        onClick={() => handleApplyRecommendation(item.id)}
                      >
                        Adjust Plan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Accuracy & SKU Performance Matrix */}
      <div className="section-card">
        <h3 className="section-title">SKU Forecast Confidence & Historical Error Matrix</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Category</th>
                <th>7-Day Demand</th>
                <th>Current Stock</th>
                <th>Stock Coverage</th>
                <th>AI Algorithm</th>
                <th>Confidence Level</th>
              </tr>
            </thead>
            <tbody>
              {skuDistribution.map(sku => (
                <tr key={sku.name}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{sku.name}</td>
                  <td><span className="badge badge-outline">{sku.category}</span></td>
                  <td><strong>{sku.demand.toLocaleString()}</strong> {sku.unit}</td>
                  <td>{sku.name === 'Milk Packet' ? '320' : sku.name === 'Bread' ? '250' : sku.name === 'Biscuits' ? '180' : sku.name === 'Cake' ? '90' : '140'} {sku.unit}</td>
                  <td>
                    <span style={{ color: sku.name === 'Milk Packet' || sku.name === 'Bread' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {sku.name === 'Milk Packet' ? '1.4 days (Tight)' : sku.name === 'Bread' ? '1.5 days' : '3.8 days'}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: '#94a3b8' }}>Weighted Moving Avg + Trend</td>
                  <td><span className="badge badge-success">94.8% High</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
