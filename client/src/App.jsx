import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, normalizeRole } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DemandForecast from './pages/DemandForecast';
import ProductionPlanning from './pages/ProductionPlanning';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';

const ROLE_ALLOWED_ROUTES = {
  admin: ['/dashboard', '/forecast', '/production', '/inventory', '/alerts', '/analytics', '/expiries'],
  production_manager: ['/dashboard', '/production', '/alerts', '/analytics'],
  demand_planner: ['/dashboard', '/forecast', '/analytics', '/alerts'],
  inventory_manager: ['/dashboard', '/inventory', '/alerts', '/expiries']
};

const ProtectedRoute = ({ children, path }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (path) {
    const roleKey = normalizeRole(user?.roleKey || user?.role);
    const allowed = ROLE_ALLOWED_ROUTES[roleKey] || ROLE_ALLOWED_ROUTES.admin;
    if (!allowed.includes(path)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute path="/dashboard"><Dashboard /></ProtectedRoute>} />
      <Route path="/forecast" element={<ProtectedRoute path="/forecast"><DemandForecast /></ProtectedRoute>} />
      <Route path="/production" element={<ProtectedRoute path="/production"><ProductionPlanning /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute path="/inventory"><Inventory key="materials" defaultTab="materials" /></ProtectedRoute>} />
      <Route path="/expiries" element={<ProtectedRoute path="/expiries"><Inventory key="batches" defaultTab="batches" /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute path="/alerts"><Alerts /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute path="/analytics"><Analytics /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
