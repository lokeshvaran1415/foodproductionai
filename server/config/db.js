const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState >= 1) {
    global.DB_CONNECTED = true;
    return mongoose.connection;
  }

  // If a connection attempt is in-flight, return the existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_production_ai';

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      global.DB_CONNECTED = true;
      console.log(`✅ MongoDB connected successfully to Atlas host: ${conn.connection.host}`);

      // Auto-seed if database has no users
      try {
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('🌱 Initial database is empty. Auto-seeding demo users and initial records...');
          const seed = require('../seed');
          await seed(false);
        }
      } catch (seedErr) {
        console.warn('⚠️ Auto-seed check skipped:', seedErr.message);
      }

      return conn;
    } catch (err) {
      global.DB_CONNECTED = false;
      connectionPromise = null;
      console.warn(`⚠️ MongoDB Connection Error (${err.message}). Application running with demo fallback.`);
      return null;
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
