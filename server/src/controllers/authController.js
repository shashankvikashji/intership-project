const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isConnected } = require('../config/db');
const { state, nid, ensureSeeded, publicUser } = require('../services/store');
const { signToken } = require('../middleware/auth');

const registerChecks = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
const loginChecks = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

function fail(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  return null;
}

async function register(req, res, next) {
  try {
    if (fail(req, res)) return;
    await ensureSeeded();
    const { name, email, password } = req.body;
    if (isConnected()) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash, interests: [] });
      const token = signToken(user._id);
      return res.status(201).json({ token, user: { _id: user._id, name, email, interests: [], role: 'user' } });
    }
    const existing = state.users.find(u => u.email === email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { _id: nid('user'), name, email, password: hash, avatar: '', interests: [], preferredTopics: [], language: 'en', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    state.users.push(user);
    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    if (fail(req, res)) return;
    await ensureSeeded();
    const { email, password } = req.body;
    if (isConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
      const token = signToken(user._id);
      return res.json({ token, user: { _id: user._id, name: user.name, email: user.email, interests: user.interests, avatar: user.avatar, role: user.role || 'user' } });
    }
    const user = state.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    await ensureSeeded();
    if (isConnected()) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: { _id: user._id, name: user.name, email: user.email, interests: user.interests, preferredTopics: user.preferredTopics, language: user.language, avatar: user.avatar, role: user.role || 'user' } });
    }
    const user = state.users.find(u => String(u._id) === String(req.userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
}

module.exports = { register, login, me, registerChecks, loginChecks };
