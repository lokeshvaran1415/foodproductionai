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

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/production', require('./routes/production'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/products', require('./routes/products'));

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  db: global.DB_CONNECTED ? 'mongodb' : 'demo_mode',
  time: new Date().toISOString()
}));

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
// Only start listening when run directly (not when required as a Vercel serverless function)
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 FoodProd AI unified server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
