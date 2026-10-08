const path = require('path');
const dotenv = require('dotenv');

// Load env from every conventional location without overriding real
// environment variables. `npm --prefix server ...` runs scripts with
// cwd=server/, so the default cwd lookup alone misses the repo-root .env.
dotenv.config(); // cwd (whatever it is)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') }); // server/.env
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') }); // repo root/.env

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'lumen-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  newsApiKey: process.env.NEWS_API_KEY || '',
  // GNews (https://gnews.io) key for live headlines. Server-side only —
  // never import this into client code. Empty = /api/live serves demo data.
  gnewsApiKey: process.env.GNEWS_API_KEY || '',
  // Optional AI provider (OpenAI-compatible chat completions endpoint).
  // Empty = AI summary/Q&A use the built-in extractive fallback (no key needed).
  aiApiKey: process.env.AI_API_KEY || '',
  aiBaseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  // Comma-separated emails granted the admin role (stats dashboard, read-only).
  adminEmails: (process.env.ADMIN_EMAILS || 'demo@lumen.news')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  demoMode: !process.env.MONGO_URI
};
