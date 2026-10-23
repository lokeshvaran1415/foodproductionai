const jwt = require('jsonwebtoken');

const DEMO_USERS = [
  { _id: 'demo-admin',     name: 'Admin User',      email: 'admin@foodprod.com',     password: 'demo1234', role: 'admin', roleTitle: 'Administrator' },
  { _id: 'demo-manager',   name: 'Rajesh Kumar',    email: 'production@foodprod.com',password: 'demo1234', role: 'production_manager', roleTitle: 'Production Manager' },
  { _id: 'demo-manager-alias', name: 'Rajesh Kumar', email: 'manager@foodprod.com',   password: 'demo1234', role: 'production_manager', roleTitle: 'Production Manager' },
  { _id: 'demo-planner',   name: 'Ananya Iyer',     email: 'planner@foodprod.com',   password: 'demo1234', role: 'demand_planner', roleTitle: 'Demand Planner' },
  { _id: 'demo-inventory', name: 'Vikram Singh',    email: 'inventory@foodprod.com', password: 'demo1234', role: 'inventory_manager', roleTitle: 'Inventory Manager' }
];

const ROLE_LABELS = {
  admin: 'Administrator',
  production_manager: 'Production Manager',
  demand_planner: 'Demand Planner',
  inventory_manager: 'Inventory Manager'
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'foodprodai_secret_2024_demo', { expiresIn: '7d' });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Try MongoDB first
    if (global.DB_CONNECTED) {
      const User = require('../models/User');
      let user = await User.findOne({ email });
      if (!user) {
        // If not in DB yet, check demo users and insert
        const demoMatch = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (demoMatch) {
          try {
            user = await User.create({
              name: demoMatch.name,
              email: demoMatch.email,
              password: demoMatch.password,
              role: demoMatch.role
            });
          } catch (e) {
            user = demoMatch;
          }
        }
      }

      if (user && user.matchPassword) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      } else if (user && user.password && user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (user) {
        // Ensure user names match required personas
        if (email === 'planner@foodprod.com' && user.name !== 'Ananya Iyer') {
          user.name = 'Ananya Iyer';
          if (typeof user.save === 'function') await user.save();
        }
        if (email === 'inventory@foodprod.com' && user.name !== 'Vikram Singh') {
          user.name = 'Vikram Singh';
          if (typeof user.save === 'function') await user.save();
        }
        if ((email === 'production@foodprod.com' || email === 'manager@foodprod.com') && user.name !== 'Rajesh Kumar') {
          user.name = 'Rajesh Kumar';
          if (typeof user.save === 'function') await user.save();
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleTitle: ROLE_LABELS[user.role] || user.role,
          token: generateToken(user._id, user.role)
        });
      }
    }

    // Demo mode fallback
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const { password: _, ...safeUser } = user;
    return res.json({ ...safeUser, roleTitle: ROLE_LABELS[user.role] || user.role, token: generateToken(user._id, user.role) });

  } catch (err) {
    // Final fallback
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const { password: _, ...safeUser } = user;
    return res.json({ ...safeUser, roleTitle: ROLE_LABELS[user.role] || user.role, token: generateToken(user._id, user.role) });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!global.DB_CONNECTED) {
      return res.status(503).json({ message: 'Registration unavailable in demo mode. Use demo accounts.' });
    }
    const User = require('../models/User');
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { login, register, getMe };
