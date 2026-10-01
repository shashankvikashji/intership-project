const mongoose = require('mongoose');
const env = require('./env');

let connected = false;

async function connectDB() {
  if (!env.mongoUri) {
    console.log('[db] No MONGO_URI set — running in memory demo mode.');
    return false;
  }
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log('[db] Connected to MongoDB');
    return true;
  } catch (err) {
    console.log('[db] MongoDB connection failed, falling back to memory store:', err.message);
    return false;
  }
}

function isConnected() {
  return connected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isConnected };
