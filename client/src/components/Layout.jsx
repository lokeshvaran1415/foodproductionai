import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, normalizeRole, ROLE_LABELS } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_NAV_CONFIG = {
  admin: [
    { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
    { to: '/forecast',   icon: '📈', label: 'Demand Forecast' },
    { to: '/production', icon: '🏭', label: 'Production Planning' },
    { to: '/inventory',  icon: '📦', label: 'Inventory' },
    { to: '/alerts',     icon: '🚨', label: 'Alerts' },
    { to: '/analytics',  icon: '📉', label: 'Analytics' },
  ],
  production_manager: [
    { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
    { to: '/production', icon: '🏭', label: 'Production Planning' },
    { to: '/alerts',     icon: '🚨', label: 'Line Alerts' },
    { to: '/analytics',  icon: '📉', label: 'Analytics' },
  ],
  demand_planner: [
    { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
    { to: '/forecast',   icon: '📈', label: 'Demand Forecast' },
    { to: '/analytics',  icon: '📉', label: 'Trend Analytics' },
    { to: '/alerts',     icon: '🚨', label: 'Alerts' },
  ],
  inventory_manager: [
    { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
    { to: '/inventory',  icon: '📦', label: 'Inventory Levels' },
    { to: '/alerts',     icon: '🚨', label: 'Stock Alerts' },
    { to: '/expiries',   icon: '⏰', label: 'Expiries' },
  ]
};

const ROLE_THEMES = {
  admin:              { badge: 'badge-info',    color: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)' },
  production_manager: { badge: 'badge-success', color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
  demand_planner:     { badge: 'badge-info',    color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.25)' },
  inventory_manager:  { badge: 'badge-warning', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' }
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleKey = normalizeRole(user?.roleKey || user?.role);
  const navItems = ROLE_NAV_CONFIG[roleKey] || ROLE_NAV_CONFIG.admin;
  const roleTitle = user?.role || ROLE_LABELS[roleKey] || 'Administrator';
  const roleTheme = ROLE_THEMES[roleKey] || ROLE_THEMES.admin;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon-sm">🏭</span>
          <div>
            <div className="brand-name">FoodProd AI</div>
            <div className="brand-tagline">Role-Based Intelligence</div>
          </div>
        </div>

        {/* Active Role Indicator in Sidebar */}
        <div style={{
          margin: '12px 12px 4px 12px',
          padding: '8px 10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Role</span>
          <span className={`badge ${roleTheme.badge}`} style={{ fontSize: '10px' }}>{roleTitle}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile Card */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{
              background: `linear-gradient(135deg, ${roleTheme.color}, #3b82f6)`,
              boxShadow: `0 0 10px ${roleTheme.glow}`
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name" title={user?.name}>{user?.name || 'Admin User'}</div>
              <div className="user-role" style={{ color: roleTheme.color, fontWeight: 500 }}>{roleTitle}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out of current role">⎋ Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="system-label">AI-Driven Food Production Planning & Inventory Management System</span>
          </div>
          <div className="topbar-right">
            <span className={`badge ${roleTheme.badge}`}>● {roleTitle}</span>
            <span className="topbar-time">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
