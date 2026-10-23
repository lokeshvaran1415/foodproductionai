import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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

export default function ProductionDashboard({ user }) {
  // Hourly throughput bar chart data
  const hourlyData = [
    { time: '08:00', actual: 280, target: 320 },
    { time: '10:00', actual: 350, target: 360 },
    { time: '12:00', actual: 390, target: 380 },
    { time: '14:00', actual: 420, target: 400 },
    { time: '16:00', actual: 410, target: 400 },
    { time: '18:00', actual: 450, target: 440 },
    { time: '20:00', actual: 300, target: 300 },
  ];

  // Manufacturing lines status & downtime
  const [lines] = useState([
    { id: 'Line A', name: 'Bakery - High Speed Bread & Cake', status: 'running', uptime: 94.2, speed: '160 u/hr', todayOutput: 1090, target: 1100, downtimeMin: 12, operator: 'M. Ramesh' },
    { id: 'Line B', name: 'Bakery - Biscuit Baking & Packaging', status: 'running', uptime: 91.5, speed: '70 u/hr', todayOutput: 490, target: 500, downtimeMin: 18, operator: 'K. Sunil' },
    { id: 'Line C', name: 'Dairy - Fresh Milk Bottling & Yogurt', status: 'running', uptime: 88.0, speed: '180 u/hr', todayOutput: 1020, target: 1200, downtimeMin: 34, operator: 'S. Verma' },
    { id: 'Line D', name: 'Confectionery - Cocoa & Speciality', status: 'maintenance', uptime: 42.0, speed: '0 u/hr', todayOutput: 0, target: 200, downtimeMin: 145, operator: 'Line Idle' },
    { id: 'Line E', name: 'Auxiliary - Packaging & Standby', status: 'running', uptime: 98.5, speed: 'Standby Ready', todayOutput: 0, target: 0, downtimeMin: 0, operator: 'Ready' },
  ]);

  // Batch Delay Alerts
  const [delayAlerts, setDelayAlerts] = useState([
    { id: 'd1', line: 'Line A', batchCode: 'BR-2024-089', sku: 'Bread', delay: '+22 min', reason: 'Proofing chamber temperature fluctuation', severity: 'warning', resolved: false },
    { id: 'd2', line: 'Line C', batchCode: 'MK-2024-401', sku: 'Milk Packet', delay: '+38 min', reason: 'Flow valve sensor recalibration required', severity: 'critical', resolved: false },
  ]);

  const handleResolveDelay = (id) => {
    setDelayAlerts(delayAlerts.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success('Batch delay alert acknowledged & technician dispatched!');
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="page-title">Shop-Floor Production Operations</h1>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>Production Manager: {user?.name || 'Rajesh Kumar'}</span>
          </div>
          <p className="page-subtitle">Real-time line execution, shift throughput tracking, equipment efficiency (OEE) & delay monitoring</p>
        </div>
        <div className="header-meta">
          <span className="badge badge-success">● 4/5 Running</span>
          <span className="badge badge-warning">2 Batch Delays</span>
          <span className="text-muted">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Production KPIs */}
      <div className="kpi-grid">
        <KPICard
          title="Today's Production"
          value="2,600 / 3,000 units"
          icon="🏭"
          color="#10b981"
          subtitle="86.7% daily target achieved"
          badge="Shift 1 & 2"
        />
        <KPICard
          title="Active Lines"
          value="4 / 5 running"
          icon="⚡"
          color="#6366f1"
          subtitle="Line A, B, C, E online • Line D down"
          badge="80% Active"
        />
        <KPICard
          title="Equipment Efficiency (OEE)"
          value="84.2%"
          icon="⚙️"
          color="#0ea5e9"
          subtitle="Target: >80% (Avail: 89%, Perf: 96%)"
          badge="Optimal"
        />
        <KPICard
          title="Batch Delay Alerts"
          value="2 delays flagged"
          icon="🚨"
          color="#ef4444"
          subtitle="Line A (+22m), Line C (+38m)"
          badge="Action Req."
        />
      </div>

      {/* Production Target Progress Bar */}
      <div className="section-card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>Daily Shift Progress to Target</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>2,600 / 3,000 units (86.7%)</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: '86.7%', height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Hourly Throughput Bar Chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Hourly Line Throughput (Units vs Target)</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Floor Units/hr</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Output" />
              <Bar dataKey="target" fill="#6366f1" radius={[4, 4, 0, 0]} name="Planned Target" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Downtime Breakdown Card */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="chart-title" style={{ margin: 0 }}>Line Downtime & Operational Uptime</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Target: &gt;90% Uptime</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
            {lines.map(line => (
              <div key={line.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{line.id} — {line.name.split('-')[0]}</span>
                  <span style={{ color: line.uptime >= 90 ? '#10b981' : line.uptime > 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                    {line.uptime}% Uptime {line.downtimeMin > 0 ? `(${line.downtimeMin}m down)` : ''}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${line.uptime}%`,
                    height: '100%',
                    background: line.uptime >= 90 ? '#10b981' : line.uptime > 50 ? '#f59e0b' : '#ef4444',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Delay Alerts Section */}
      <div className="section-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Active Batch Delay Alerts (Shop-Floor Intervention)</h3>
          <span className="badge badge-danger">2 Active Delays</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>Batch Code</th>
                <th>Product SKU</th>
                <th>Delay Offset</th>
                <th>Root Cause / Floor Telemetry</th>
                <th>Severity</th>
                <th>Floor Action</th>
              </tr>
            </thead>
            <tbody>
              {delayAlerts.map(alert => (
                <tr key={alert.id} style={{ opacity: alert.resolved ? 0.6 : 1 }}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{alert.line}</td>
                  <td><code>{alert.batchCode}</code></td>
                  <td>{alert.sku}</td>
                  <td style={{ color: '#ef4444', fontWeight: 700 }}>{alert.delay}</td>
                  <td>{alert.reason}</td>
                  <td>
                    <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {alert.resolved ? (
                      <span className="badge badge-success">✓ Dispatched</span>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 10px', fontSize: '11px', background: '#ef4444' }}
                        onClick={() => handleResolveDelay(alert.id)}
                      >
                        Dispatch Tech
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Equipment Status Table */}
      <div className="section-card">
        <h3 className="section-title">Shop-Floor Manufacturing Line Status</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Line ID</th>
                <th>Equipment / Product Focus</th>
                <th>Status</th>
                <th>Run Speed</th>
                <th>Today's Output</th>
                <th>Shift Operator</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.id}>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{line.id}</td>
                  <td>{line.name}</td>
                  <td>
                    <span className={`badge ${line.status === 'running' ? 'badge-success' : 'badge-danger'}`}>
                      {line.status === 'running' ? '● RUNNING' : '■ MAINTENANCE'}
                    </span>
                  </td>
                  <td>{line.speed}</td>
                  <td>
                    <strong>{line.todayOutput.toLocaleString()}</strong>
                    {line.target > 0 && <span className="text-muted"> / {line.target.toLocaleString()} units</span>}
                  </td>
                  <td>{line.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
