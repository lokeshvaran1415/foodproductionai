const connectDB = require('../server/config/db');
const app = require('../server/server');

module.exports = async (req, res) => {
  // Ensure DB connection is initiated in serverless environment
  try {
    await connectDB();
  } catch (err) {
    console.warn('MongoDB connection warning:', err.message);
  }

  // Ensure request URL preserves /api prefix if stripped by Vercel rewrite
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  return app(req, res);
};
