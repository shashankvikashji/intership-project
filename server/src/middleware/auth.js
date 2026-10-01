const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// Required auth — 401 when missing/invalid.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// Optional auth — attaches userId when a valid token is present, never rejects.
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.userId = jwt.verify(token, env.jwtSecret).sub;
    } catch { /* demo/anonymous */ }
  }
  next();
}

module.exports = { signToken, requireAuth, optionalAuth };
