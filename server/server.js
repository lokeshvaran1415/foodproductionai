require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Global DB connection state
global.DB_CONNECTED = false;

// Connect to MongoDB
connectDB();

// API Routes (mounted under both /api and root to handle any proxy rewrite behavior)
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, require('./routes/auth'));
  app.use(`${prefix}/dashboard`, require('./routes/dashboard'));
  app.use(`${prefix}/forecast`, require('./routes/forecast'));
  app.use(`${prefix}/production`, require('./routes/production'));
  app.use(`${prefix}/inventory`, require('./routes/inventory'));
  app.use(`${prefix}/alerts`, require('./routes/alerts'));
  app.use(`${prefix}/analytics`, require('./routes/analytics'));
  app.use(`${prefix}/products`, require('./routes/products'));
  app.get(`${prefix}/health`, (req, res) => res.json({
    status: 'ok',
    db: global.DB_CONNECTED ? 'mongodb' : 'demo_mode',
    time: new Date().toISOString()
  }));
};

registerRoutes('/api');
registerRoutes('');

// Serve static frontend in production (for unified local hosting or container deploy)
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client routing (skip API requests)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module || process.env.PORT) {
  app.listen(PORT, () => {
    console.log(`🚀 FoodProd AI server running on port ${PORT}`);
  });
}

module.exports = app;
