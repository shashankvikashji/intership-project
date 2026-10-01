const User = require('../models/User');
const { isConnected } = require('../config/db');
const { state, ensureSeeded, publicUser } = require('../services/store');

async function getPreferences(req, res, next) {
  try {
    await ensureSeeded();
    if (isConnected()) {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ interests: user.interests || [], preferredTopics: user.preferredTopics || [], language: user.language || 'en' });
    }
    const user = state.users.find(u => String(u._id) === String(req.userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ interests: user.interests || [], preferredTopics: user.preferredTopics || [], language: user.language || 'en' });
  } catch (err) { next(err); }
}

async function savePreferences(req, res, next) {
  try {
    await ensureSeeded();
    const { interests = [], preferredTopics = [], language = 'en' } = req.body || {};
    const clean = arr => [...new Set((Array.isArray(arr) ? arr : []).map(String).map(s => s.trim()).filter(Boolean))].slice(0, 20);
    if (isConnected()) {
      const user = await User.findByIdAndUpdate(
        req.userId,
        { interests: clean(interests), preferredTopics: clean(preferredTopics), language: String(language || 'en').slice(0, 10) },
        { new: true }
      ).lean();
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ ok: true, interests: user.interests, preferredTopics: user.preferredTopics, language: user.language });
    }
    const user = state.users.find(u => String(u._id) === String(req.userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.interests = clean(interests);
    user.preferredTopics = clean(preferredTopics);
    user.language = String(language || 'en').slice(0, 10);
    user.updatedAt = new Date().toISOString();
    res.json({ ok: true, interests: user.interests, preferredTopics: user.preferredTopics, language: user.language });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    await ensureSeeded();
    const { name, avatar } = req.body || {};
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    if (isConnected()) {
      const patch = {};
      if (name !== undefined) patch.name = String(name).trim().slice(0, 60);
      if (avatar !== undefined) patch.avatar = String(avatar).slice(0, 500);
      const user = await User.findByIdAndUpdate(req.userId, patch, { new: true }).lean();
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: { _id: user._id, name: user.name, email: user.email, interests: user.interests, avatar: user.avatar } });
    }
    const user = state.users.find(u => String(u._id) === String(req.userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name !== undefined) user.name = String(name).trim().slice(0, 60);
    if (avatar !== undefined) user.avatar = String(avatar).slice(0, 500);
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
}

module.exports = { getPreferences, savePreferences, updateProfile };
