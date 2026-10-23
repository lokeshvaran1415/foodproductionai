import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const KPICard = ({ title, value, icon, color, subtitle, trend }) => (
  <div className="kpi-card" style={{ borderLeftColor: color }}>
    <div className="kpi-icon" style={{ background: color + '22', color }}>{icon}</div>
    <div className="kpi-content" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kpi-title">{title}</p>
        {trend && <span style={{ fontSize: '11px', color: trend.startsWith('+') ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{trend}</span>}
      </div>
      <h3 className="kpi-value">{value}</h3>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard({ user }) {
  // Plant-wide Production vs Demand Trend (7 Days)
  const trendData = [
    { day: 'Mon', production: 2400, demand: 2600 },
    { day: 'Tue', production: 2700, demand: 2850 },
    { day: 'Wed', production: 2900, demand: 2750 },
    { day: 'Thu', production: 3100, demand: 3200 },
    { day: 'Fri', production: 3400, demand: 3550 },
    { day: 'Sat', production: 2800, demand: 2900 },
    { day: 'Sun', production: 2200, demand: 2400 },
  ];

  const pieData = [
    { name: 'Normal (5 SKUs)', value: 5 },
    { name: 'Warning (1 SKU)', value: 1 },
    { name: 'Critical (2 SKUs)', value: 2 }
  ];

  const upcomingPlans = [
    { _id: '1', product: 'Bread', forecast: '1,125', planned: '875', line: 'Line A (Bakery)', status: 'in_progress', lead: 'Rajesh Kumar' },
    { _id: '2', product: 'Biscuits', forecast: '672', planned: '490', line: 'Line B (Bakery)', status: 'planned', lead: 'Rajesh Kumar' },
    { _id: '3', product: 'Cake', forecast: '305', planned: '215', line: 'Line A (Bakery)', status: 'planned', lead: 'Rajesh Kumar' },
    { _id: '4', product: 'Milk Packet', forecast: '1,580', planned: '1,260', line: 'Line C (Dairy)', status: 'in_progress', lead: 'Rajesh Kumar' },
    { _id: '5', product: 'Yogurt', forecast: '478', planned: '340', line: 'Line C (Dairy)', status: 'planned', lead: 'Rajesh Kumar' },
  ];

  // Exact KPIs specified in requirements
  const kpis = {
    todayProduction: 2600,
    forecastedDemand: 4160,
    inventoryValue: 118375,
    lowStockItems: 3,
    expiringBatches: 2,
    activeAlerts: 8
  };

  return (
    <div className="page">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="page-title">Plant Operations Overview</h1>
            <span className="badge badge-info" style={{ fontSize: '11px' }}>Administrator View</span>
          </div>
          <p className="page-subtitle">Consolidated operational metrics, manufacturing status & plant-wide resource telemetry</p>
        </div>
        <div className="header-meta">
          <span className="badge badge-success">● 4/5 Lines Active</span>
          <span className="badge badge-outline">Admin: {user?.name || 'Admin User'}</span>
          <span className="text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* High-level Plant Overview KPIs */}
      <div className="kpi-grid">
        <KPICard
          title="Today's Production"
          value={kpis.todayProduction.toLocaleString() + ' units'}
          icon="🏭"
          color="#6366f1"
          subtitle="Target: 3,000 units (86.7%)"
          trend="+5.4%"
        />
        <KPICard
          title="Forecasted Demand"
          value={kpis.forecastedDemand.toLocaleString() + ' units'}
          icon="📈"
          color="#0ea5e9"
          subtitle="Next 7 days across 5 SKUs"
          trend="+12.1%"
        />
        <KPICard
          title="Inventory Value"
          value={'₹' + kpis.inventoryValue.toLocaleString()}
          icon="💰"
          color="#10b981"
          subtitle="Raw materials & packaging"
          trend="Balanced"
        />
        <KPICard
          title="Low Stock Items"
          value={kpis.lowStockItems}
          icon="⚠️"
          color="#f59e0b"
          subtitle="Milk, Butter, Cocoa Powder"
          trend="Reorder req."
        />
        <KPICard
          title="Expiring Batches"
          value={kpis.expiringBatches}
          icon="⏰"
          color="#ef4444"
          subtitle="Within 3 days (1 expired)"
          trend="Attention"
        />
        <KPICard
          title="Active Alerts"
          value={kpis.activeAlerts}
          icon="🚨"
          color="#f43f5e"
          subtitle="4 critical, 3 warning, 1 info"
          trend="Active"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Plant-wide Production vs Demand Trend */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Plant-wide Production vs Demand Trend (7 Days)</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Units / Day</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[1500, 4000]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="production" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Actual Production" />
              <Line type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" dot={{ fill: '#f59e0b', r: 4 }} name="Forecasted Demand" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Distribution Chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Inventory Health Distribution</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>8 Tracked Raw Materials</span>
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
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Health Matrix */}
      <div className="section-card" style={{ marginBottom: '16px' }}>
        <h3 className="section-title">Department Executive Health Matrix</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8' }}>Shop-Floor Production</span>
              <span className="badge badge-success">86.7% Output</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Lead: Rajesh Kumar • 4/5 lines operational. Line D undergoing maintenance.</p>
          </div>

          <div style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>Demand Forecasting</span>
              <span className="badge badge-info">94.8% Confidence</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Lead: Ananya Iyer • 2 anomalies flagged. Weekend Bread spike projected.</p>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24' }}>Inventory & Logistics</span>
              <span className="badge badge-warning">3 Critical Items</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Lead: Vikram Singh • Milk & Butter below reorder. 2 batches expire in &lt;3 days.</p>
          </div>
        </div>
      </div>

      {/* Today's Plant Production Schedule */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Plant Master Production Schedule</h3>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Target: 3,000 units</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Production Line</th>
                <th>Line Supervisor</th>
                <th>Forecast Demand</th>
                <th>Planned Output</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingPlans.map(plan => (
                <tr key={plan._id}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{plan.product}</td>
                  <td>{plan.line}</td>
                  <td>{plan.lead}</td>
                  <td>{plan.forecast} units</td>
                  <td>{plan.planned} units</td>
                  <td>
                    <span className={`badge ${plan.status === 'in_progress' ? 'badge-warning' : 'badge-info'}`}>
                      {plan.status === 'in_progress' ? 'In Production' : 'Scheduled'}
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
