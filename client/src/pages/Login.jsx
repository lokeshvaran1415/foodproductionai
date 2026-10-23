import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

/* ── 4 Quick Demo Logins with Complete RBAC Personas ─────────────── */
const DEMO_ACCOUNTS = [
  {
    roleKey: 'admin',
    label: 'Admin',
    name: 'Admin User',
    role: 'Administrator',
    email: 'admin@foodprod.com',
    description: 'Plant-wide KPIs & operations control',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    roleKey: 'production_manager',
    label: 'Production Manager',
    name: 'Rajesh Kumar',
    role: 'Production Manager',
    email: 'production@foodprod.com',
    description: 'Shop-floor execution & lines OEE',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    roleKey: 'demand_planner',
    label: 'Demand Planner',
    name: 'Ananya Iyer',
    role: 'Demand Planner',
    email: 'planner@foodprod.com',
    description: 'Forecasting intelligence & surge alerts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    roleKey: 'inventory_manager',
    label: 'Inventory Manager',
    name: 'Vikram Singh',
    role: 'Inventory Manager',
    email: 'inventory@foodprod.com',
    description: 'Raw materials, expiries & stock levels',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

/* ── Decorative metrics (left panel only) ───────────────────────── */
const METRICS = [
  { label: 'Demand Forecast', value: '+12.4%', color: '#2dd4bf' },
  { label: 'Production', value: '87%', color: '#818cf8' },
  { label: 'Inventory', value: '92%', color: '#34d399' },
  { label: 'Waste Risk', value: 'LOW', color: '#f472b6' },
];

const FEATURES = [
  'Role-Based Operations Dashboards',
  'AI Demand & Production Synchronization',
  'Shop-Floor Line Throughput & OEE',
  'Real-Time Expiry & Reorder Intelligence',
];

export default function Login() {
  const { setCurrentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@foodprod.com', password: 'demo1234' });
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Auto-fill corresponding email and set selected role state on quick button click
  const handleSelectRole = (acc) => {
    setSelectedRole(acc.roleKey);
    setForm({ email: acc.email, password: 'demo1234' });
    setErrorMessage('');
    toast.success(`Selected role: ${acc.label} (${acc.email})`, { duration: 1800 });
  };

  // 2. Sign In Handler
  const handleSignIn = async () => {
    setErrorMessage('');
    const emailToUse = (form.email || '').trim();

    if (!emailToUse) {
      setErrorMessage('Please enter an email address.');
      toast.error('Please enter an email address.');
      return;
    }

    // Match demo persona or fallback
    const matchedAccount = DEMO_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === emailToUse.toLowerCase()
    ) || DEMO_ACCOUNTS.find(acc => acc.roleKey === selectedRole) || {
      name: 'Admin User',
      email: emailToUse,
      role: 'Administrator',
      roleKey: 'admin'
    };

    const userProfile = {
      _id: matchedAccount._id || `user-${Date.now()}`,
      name: matchedAccount.name,
      email: emailToUse,
      role: matchedAccount.role,
      roleKey: matchedAccount.roleKey || 'admin',
      token: matchedAccount.token || `demo-token-${matchedAccount.roleKey || 'admin'}`
    };

    // Save active user profile (name, email, role) to localStorage.setItem('currentUser', ...)
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    localStorage.setItem('user', JSON.stringify(userProfile));
    localStorage.setItem('token', userProfile.token);

    // Update React AuthContext state
    if (typeof setCurrentUser === 'function') {
      setCurrentUser(userProfile);
    }

    // Attempt backend sync in background
    api.post('/auth/login', { email: emailToUse, password: form.password || 'demo1234' })
      .then(res => {
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
        }
      })
      .catch(() => { });

    toast.success(`Welcome back, ${userProfile.name}!`);

    // Route user immediately to /dashboard
    navigate('/dashboard');
  };

  return (
    <div className="lp-root">

      {/* ══ LEFT ════════════════════════════════════════════════════ */}
      <div className="lp-left">
        {/* ambient blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />

        <div className="lp-left-inner">
          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-logo-mark">
              <svg viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="9" fill="url(#lg1)" />
                <path d="M9 21 L16 9 L23 21" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="24" r="2" fill="#2dd4bf" />
              </svg>
            </div>
            <span className="lp-logo-text">FoodProd AI</span>
          </div>

          {/* Headline */}
          <div className="lp-hero">
            <h1 className="lp-headline">
              Smarter Production.<br />
              <span className="lp-accent-text">Less Waste.</span>
            </h1>
            <p className="lp-subline">
              AI-powered demand forecasting, production planning and inventory
              intelligence for modern food manufacturers.
            </p>
          </div>

          {/* Compact AI metrics panel */}
          <div className="lp-panel">
            <div className="lp-panel-bar">
              <span className="lp-dot rd" />
              <span className="lp-dot yl" />
              <span className="lp-dot gn" />
              <span className="lp-panel-label">AI Operations Center</span>
              <span className="lp-live">● LIVE</span>
            </div>
            <div className="lp-metrics">
              {METRICS.map(m => (
                <div className="lp-metric" key={m.label}>
                  <span className="lp-metric-lbl">{m.label}</span>
                  <span className="lp-metric-val" style={{ color: m.color }}>{m.value}</span>
                  <div className="lp-bar-bg">
                    <div className="lp-bar-fill" style={{
                      width: m.value.includes('%') ? m.value : '65%',
                      background: m.color
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature pills */}
          <div className="lp-features">
            {FEATURES.map(f => (
              <div className="lp-feature" key={f}>
                <span className="lp-feat-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT ═══════════════════════════════════════════════════ */}
      <div className="lp-right">
        <div className="lp-card">

          {/* Card header */}
          <div className="lp-card-head">
            <div className="lp-card-icon">
              <svg viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="clg" x1="0" y1="0" x2="28" y2="28">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <rect width="28" height="28" rx="8" fill="url(#clg)" />
                <path d="M8 18 L14 8 L20 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="14" cy="21" r="1.8" fill="#2dd4bf" />
              </svg>
            </div>
            <div>
              <h2 className="lp-card-title">Welcome back</h2>
              <p className="lp-card-sub">Sign in with role-based access</p>
            </div>
          </div>

          {/* Role selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p className="lp-role-heading" style={{ margin: 0 }}>Quick Demo Access</p>
            <span style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 500 }}>Click to auto-fill</span>
          </div>

          <div className="lp-role-grid">
            {DEMO_ACCOUNTS.map(acc => {
              const isActive = selectedRole === acc.roleKey || form.email === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  className={`lp-role-btn${isActive ? ' lp-role-active' : ''}`}
                  onClick={() => handleSelectRole(acc)}
                  title={`Select ${acc.label} (${acc.name})`}
                >
                  <span className="lp-role-icon">{acc.icon}</span>
                  <span className="lp-role-name">{acc.label}</span>
                  <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600, display: 'block', margin: '1px 0' }}>{acc.name}</span>
                  <span className="lp-role-desc">{acc.description}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="lp-divider">
            <span /><p>or sign in manually</p><span />
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="10" cy="10" r="8" />
                <line x1="10" y1="6" x2="10" y2="10" />
                <circle cx="10" cy="14" r="0.5" fill="currentColor" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form with onSubmit handleSignIn */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
            className="lp-form"
          >
            <div className="lp-field">
              <label htmlFor="lp-email">Email address</label>
              <div className="lp-input-wrap">
                <svg className="lp-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2.5 5.5h15l-7.5 6-7.5-6z" />
                  <rect x="2.5" y="5.5" width="15" height="10" rx="1.5" />
                </svg>
                <input
                  id="lp-email" type="email"
                  value={form.email}
                  onChange={e => {
                    const newEmail = e.target.value;
                    setForm({ ...form, email: newEmail });
                    const match = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === newEmail.toLowerCase());
                    if (match) setSelectedRole(match.roleKey);
                  }}
                  placeholder="you@company.com"
                  required autoComplete="email"
                />
              </div>
            </div>

            <div className="lp-field">
              <label htmlFor="lp-password">Password</label>
              <div className="lp-input-wrap">
                <svg className="lp-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="1.5" />
                  <path d="M7 9V7a3 3 0 0 1 6 0v2" />
                  <circle cx="10" cy="13.5" r="1.2" fill="currentColor" />
                </svg>
                <input
                  id="lp-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required autoComplete="current-password"
                />
                <button
                  type="button" className="lp-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1} aria-label="Toggle password"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                      <circle cx="10" cy="10" r="2.5" />
                      <line x1="3" y1="3" x2="17" y2="17" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                      <circle cx="10" cy="10" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-submit" disabled={loading} id="sign-in-btn">
              {loading ? (
                <span className="lp-spinner" />
              ) : (
                <>
                  Sign In &rarr;
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                    <path d="M4 10h12M12 6l4 4-4 4" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="lp-hint">Demo accounts password: <strong>demo1234</strong></p>
        </div>
      </div>
    </div>
  );
}
