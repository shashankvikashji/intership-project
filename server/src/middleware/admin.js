const env = require('../config/env');

// Admin is read-only stats. A user is admin when their email is listed in
// ADMIN_EMAILS (defaults to the demo account) or their role is 'admin'.
function isAdminUser(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return env.adminEmails.includes(String(user.email || '').toLowerCase());
}

function requireAdmin(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const { state } = require('../services/store');
  const { isConnected } = require('../config/db');
  const User = require('../models/User');
  (async () => {
    let user = null;
    if (isConnected()) user = await User.findById(req.userId).lean();
    else user = state.users.find(u => String(u._id) === String(req.userId)) || null;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!isAdminUser(user)) return res.status(403).json({ error: 'Admin access required' });
    req.adminUser = user;
    next();
  })().catch(next);
}

module.exports = { isAdminUser, requireAdmin };
