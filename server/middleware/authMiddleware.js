const jwt = require('jsonwebtoken');

const DEMO_USERS = [
  { _id: 'demo-admin',     name: 'Admin User',      email: 'admin@foodprod.com',     role: 'admin' },
  { _id: 'demo-manager',   name: 'Rajesh Kumar',    email: 'production@foodprod.com',role: 'production_manager' },
  { _id: 'demo-manager-alias', name: 'Rajesh Kumar', email: 'manager@foodprod.com',   role: 'production_manager' },
  { _id: 'demo-planner',   name: 'Ananya Iyer',     email: 'planner@foodprod.com',   role: 'demand_planner' },
  { _id: 'demo-inventory', name: 'Vikram Singh',    email: 'inventory@foodprod.com', role: 'inventory_manager' }
];

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodprodai_secret_2024_demo');

      if (global.DB_CONNECTED) {
        const User = require('../models/User');
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        // Demo mode: use in-memory user
        req.user = DEMO_USERS.find(u => u._id === decoded.id) ||
          { _id: decoded.id, role: decoded.role, name: 'Demo User', email: 'demo@foodprod.com' };
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };
