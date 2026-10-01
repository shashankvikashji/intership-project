require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'lumen-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  newsApiKey: process.env.NEWS_API_KEY || '',
  demoMode: !process.env.MONGO_URI
};
