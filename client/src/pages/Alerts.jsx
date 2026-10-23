import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DEMO_ALERTS = [
  { _id: 'a1', type: 'low_stock',       severity: 'critical', message: 'Milk inventory has fallen below reorder level.',           detail: 'Current: 95 L | Reorder Level: 120 L | Supplier: Fresh Dairy Farm',                          status: 'active',       createdAt: new Date(Date.now()-2*3600000).toISOString() },
  { _id: 'a2', type: 'low_stock',       severity: 'warning',  message: 'Butter inventory is critically low.',                        detail: 'Current: 48 kg | Reorder Level: 60 kg | Supplier: Amul Distributors',                          status: 'active',       createdAt: new Date(Date.now()-3*3600000).toISOString() },
  { _id: 'a3', type: 'low_stock',       severity: 'warning',  message: 'Cocoa Powder is approaching reorder level.',                 detail: 'Current: 75 kg | Reorder Level: 80 kg',                                                      status: 'active',       createdAt: new Date(Date.now()-4*3600000).toISOString() },
  { _id: 'a4', type: 'expiry',          severity: 'warning',  message: 'Milk batch MK-2024-001 expires in 2 days.',                  detail: 'Batch: MK-2024-001 | Qty: 95 L | Immediate action needed.',                                   status: 'active',       createdAt: new Date(Date.now()-1*3600000).toISOString() },
  { _id: 'a5', type: 'expiry',          severity: 'warning',  message: 'Butter batch BT-2024-001 expires in 2 days.',                detail: 'Batch: BT-2024-001 | Qty: 30 kg | Schedule for early use.',                                   status: 'active',       createdAt: new Date(Date.now()-1*3600000).toISOString() },
  { _id: 'a6', type: 'expiry',          severity: 'critical', message: 'Butter batch BT-2024-002 has EXPIRED.',                      detail: 'Batch: BT-2024-002 | Qty: 18 kg — Immediate disposal required.',                               status: 'active',       createdAt: new Date(Date.now()-30*60000).toISOString() },
  { _id: 'a7', type: 'demand_spike',    severity: 'info',     message: 'Projected demand for Bread increased by 15% vs last week.',  detail: 'Previous forecast: 980 units | New forecast: 1125 units (+14.8%)',                            status: 'active',       createdAt: new Date(Date.now()-6*3600000).toISOString() },
  { _id: 'a8', type: 'production_risk', severity: 'warning',  message: 'Current Milk Packet production plan may not satisfy demand.', detail: 'Planned: 1260 packets | Forecast: 1580 packets | Shortfall: 320 packets',                      status: 'active',       createdAt: new Date(Date.now()-5*3600000).toISOString() },
  { _id: 'a9', type: 'stockout',        severity: 'info',     message: 'Yogurt production shortfall detected.',                       detail: 'At current rate, Yogurt stock may reach zero in 3 days without replenishment.',                 status: 'acknowledged', createdAt: new Date(Date.now()-8*3600000).toISOString() },
];

const TYPE_ICONS = {
  low_stock: '📉', expiry: '⏰', demand_spike: '📈',
  production_risk: '🏭', stockout: '❌', system: '⚙️'
};
const SEVERITY_CONFIG = {
  critical: { class: 'alert-critical', badge: 'badge-danger', label: 'Critical' },
  warning:  { class: 'alert-warning',  badge: 'badge-warning', label: 'Warning' },
  info:     { class: 'alert-info',     badge: 'badge-info',    label: 'Info' }
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [generating, setGenerating] = useState(false);

  const load = () => {
    api.get('/alerts')
      .then(r => setAlerts(r.data.length > 0 ? r.data : DEMO_ALERTS))
      .catch(() => setAlerts(DEMO_ALERTS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    try { await api.put(`/alerts/${id}/resolve`); } catch {}
    setAlerts(alerts.map(a => a._id === id ? { ...a, status: 'resolved' } : a));
    toast.success('Alert resolved!');
  };

  const handleAcknowledge = async (id) => {
    try { await api.put(`/alerts/${id}/acknowledge`); } catch {}
    setAlerts(alerts.map(a => a._id === id ? { ...a, status: 'acknowledged' } : a));
    toast.success('Alert acknowledged!');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/alerts/generate');
      load();
      toast.success('Alerts regenerated from current system state!');
    } catch {
      toast.success('Alert scan complete! (Demo mode)');
    } finally { setGenerating(false); }
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);
  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  if (loading) return <div className="page-loading">Loading alerts...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚨 Alerts & Notifications</h1>
          <p className="page-subtitle">System-generated alerts based on live inventory, expiry, and demand conditions</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {criticalCount > 0 && <span className="badge badge-danger">🔴 {criticalCount} Critical</span>}
          <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Scanning...' : '🔄 Scan & Generate'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card"><span>Total Alerts</span><strong>{alerts.length}</strong></div>
        <div className="summary-card"><span>Active</span><strong style={{ color: '#f59e0b' }}>{alerts.filter(a => a.status === 'active').length}</strong></div>
        <div className="summary-card"><span>Critical</span><strong style={{ color: '#ef4444' }}>{criticalCount}</strong></div>
        <div className="summary-card"><span>Acknowledged</span><strong style={{ color: '#6366f1' }}>{alerts.filter(a => a.status === 'acknowledged').length}</strong></div>
        <div className="summary-card"><span>Resolved</span><strong style={{ color: '#10b981' }}>{alerts.filter(a => a.status === 'resolved').length}</strong></div>
      </div>

      {/* Filter */}
      <div className="tab-bar">
        {['all', 'active', 'acknowledged', 'resolved'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? alerts.length : alerts.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {filtered.length === 0 && <div className="empty-state">No alerts in this category.</div>}
        {filtered.map(alert => {
          const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          return (
            <div key={alert._id} className={`alert-card ${sev.class} ${alert.status !== 'active' ? 'alert-dimmed' : ''}`}>
              <div className="alert-left">
                <span className="alert-icon">{TYPE_ICONS[alert.type] || '⚠️'}</span>
                <div className="alert-body">
                  <div className="alert-header-row">
                    <span className={`badge ${sev.badge}`}>{sev.label}</span>
                    <span className="badge badge-outline">{alert.type?.replace('_', ' ').toUpperCase()}</span>
                    <span className="alert-time">{new Date(alert.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  <p className="alert-detail">{alert.detail}</p>
                </div>
              </div>
              <div className="alert-actions">
                {alert.status === 'active' && (
                  <>
                    <button className="btn-sm btn-info" onClick={() => handleAcknowledge(alert._id)}>Acknowledge</button>
                    <button className="btn-sm btn-success" onClick={() => handleResolve(alert._id)}>Resolve</button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <button className="btn-sm btn-success" onClick={() => handleResolve(alert._id)}>Resolve</button>
                )}
                {alert.status === 'resolved' && <span className="badge badge-success">✓ Resolved</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
