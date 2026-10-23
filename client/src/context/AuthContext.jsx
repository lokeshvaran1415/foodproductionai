import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

export const DEMO_ACCOUNTS = {
  admin: {
    _id: 'demo-admin',
    name: 'Admin User',
    role: 'Administrator',
    roleKey: 'admin',
    email: 'admin@foodprod.com',
    token: 'demo-token-admin'
  },
  production_manager: {
    _id: 'demo-production',
    name: 'Rajesh Kumar',
    role: 'Production Manager',
    roleKey: 'production_manager',
    email: 'production@foodprod.com',
    token: 'demo-token-production'
  },
  demand_planner: {
    _id: 'demo-planner',
    name: 'Ananya Iyer',
    role: 'Demand Planner',
    roleKey: 'demand_planner',
    email: 'planner@foodprod.com',
    token: 'demo-token-planner'
  },
  inventory_manager: {
    _id: 'demo-inventory',
    name: 'Vikram Singh',
    role: 'Inventory Manager',
    roleKey: 'inventory_manager',
    email: 'inventory@foodprod.com',
    token: 'demo-token-inventory'
  }
};

export const normalizeRole = (role) => {
  if (!role) return 'admin';
  const r = String(role).toLowerCase();
  if (r.includes('prod') || (r.includes('manager') && !r.includes('inv'))) return 'production_manager';
  if (r.includes('plan') || r.includes('demand')) return 'demand_planner';
  if (r.includes('inv') || r.includes('stock')) return 'inventory_manager';
  return 'admin';
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  production_manager: 'Production Manager',
  demand_planner: 'Demand Planner',
  inventory_manager: 'Inventory Manager',
  Administrator: 'Administrator',
  'Production Manager': 'Production Manager',
  'Demand Planner': 'Demand Planner',
  'Inventory Manager': 'Inventory Manager'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser') || localStorage.getItem('user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const roleKey = normalizeRole(parsed.roleKey || parsed.role);
      return {
        ...parsed,
        roleKey,
        role: parsed.role || ROLE_LABELS[roleKey]
      };
    } catch {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const setCurrentUser = (userData) => {
    const roleKey = normalizeRole(userData.roleKey || userData.role);
    const sessionUser = {
      _id: userData._id || `demo-${roleKey}`,
      name: userData.name,
      role: userData.role || ROLE_LABELS[roleKey],
      roleKey,
      email: userData.email,
      token: userData.token || `demo-token-${roleKey}`
    };

    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    localStorage.setItem('user', JSON.stringify(sessionUser));
    localStorage.setItem('token', sessionUser.token);
    setUser(sessionUser);
    return sessionUser;
  };

  const loginAsDemo = async (target) => {
    let demoAcc = null;
    if (typeof target === 'string') {
      const key = normalizeRole(target);
      demoAcc = DEMO_ACCOUNTS[key] || Object.values(DEMO_ACCOUNTS).find(a => a.email === target);
    } else if (target && typeof target === 'object') {
      const key = normalizeRole(target.roleKey || target.role || target.email);
      demoAcc = DEMO_ACCOUNTS[key] || target;
    }

    if (!demoAcc) {
      demoAcc = DEMO_ACCOUNTS.admin;
    }

    const sessionUser = setCurrentUser(demoAcc);

    // Sync with backend asynchronously if available
    try {
      const { data } = await api.post('/auth/login', { email: sessionUser.email, password: 'demo1234' });
      if (data?.token) {
        const syncedUser = {
          ...sessionUser,
          _id: data._id || sessionUser._id,
          token: data.token
        };
        localStorage.setItem('currentUser', JSON.stringify(syncedUser));
        localStorage.setItem('user', JSON.stringify(syncedUser));
        localStorage.setItem('token', syncedUser.token);
        setUser(syncedUser);
      }
    } catch {
      // Backend offline or error; demo state is already valid
    }

    return { success: true, user: sessionUser };
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const roleKey = normalizeRole(data.role || data.roleTitle);
      const formattedUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        roleKey,
        role: data.roleTitle || ROLE_LABELS[roleKey] || data.role,
        token: data.token
      };

      localStorage.setItem('currentUser', JSON.stringify(formattedUser));
      localStorage.setItem('user', JSON.stringify(formattedUser));
      localStorage.setItem('token', formattedUser.token);
      setUser(formattedUser);
      return { success: true, user: formattedUser };
    } catch (err) {
      // Check if email corresponds to a demo account
      const matchedDemo = Object.values(DEMO_ACCOUNTS).find(
        acc => acc.email.toLowerCase() === (email || '').toLowerCase()
      );

      if (matchedDemo && password === 'demo1234') {
        const roleKey = normalizeRole(matchedDemo.roleKey || matchedDemo.role);
        const sessionUser = {
          ...matchedDemo,
          roleKey,
          role: matchedDemo.role || ROLE_LABELS[roleKey]
        };
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        localStorage.setItem('user', JSON.stringify(sessionUser));
        localStorage.setItem('token', sessionUser.token);
        setUser(sessionUser);
        return { success: true, user: sessionUser };
      }

      const message = err.response?.data?.message || (err.message === 'Network Error' ? 'Backend server not reachable' : 'Login failed');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setCurrentUser, login, loginAsDemo, logout, loading, normalizeRole, ROLE_LABELS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
