const Interaction = require('../models/Interaction');
const { isConnected } = require('../config/db');
const { state, nid, ensureSeeded } = require('../services/store');

const VALID = new Set(['VIEW', 'OPEN', 'LIKE', 'UNLIKE', 'SAVE', 'UNSAVE', 'SKIP', 'UNSKIP', 'SHARE']);

// Toggle-style semantics: LIKE/SAVE/SKIP create or refresh a marker interaction;
// UNLIKE/UNSAVE/UNSKIP remove it. VIEW/OPEN/SHARE always append a history row.
async function record(req, res, next) {
  try {
    await ensureSeeded();
    const { articleId, type, duration = 0 } = req.body || {};
    const t = String(type || '').toUpperCase();
    if (!articleId) return res.status(400).json({ error: 'articleId is required' });
    if (!VALID.has(t)) return res.status(400).json({ error: 'Invalid interaction type' });

    if (isConnected()) {
      if (['UNLIKE', 'UNSAVE', 'UNSKIP'].includes(t)) {
        const base = t.replace('UN', '');
        await Interaction.deleteMany({ userId: req.userId, articleId, type: base });
        return res.json({ ok: true, type: t });
      }
      if (['LIKE', 'SAVE', 'SKIP'].includes(t)) {
        await Interaction.findOneAndUpdate(
          { userId: req.userId, articleId, type: t },
          { $set: { duration } },
          { upsert: true, new: true }
        );
        return res.json({ ok: true, type: t });
      }
      await Interaction.create({ userId: req.userId, articleId, type: t, duration });
      return res.json({ ok: true, type: t });
    }

    // memory store
    if (['UNLIKE', 'UNSAVE', 'UNSKIP'].includes(t)) {
      const base = t.replace('UN', '');
      state.interactions = state.interactions.filter(
        i => !(String(i.userId) === String(req.userId) && String(i.articleId) === String(articleId) && i.type === base)
      );
      return res.json({ ok: true, type: t });
    }
    if (['LIKE', 'SAVE', 'SKIP'].includes(t)) {
      const existing = state.interactions.find(
        i => String(i.userId) === String(req.userId) && String(i.articleId) === String(articleId) && i.type === t
      );
      if (!existing) {
        state.interactions.push({ _id: nid('ix'), userId: String(req.userId), articleId: String(articleId), type: t, duration, createdAt: new Date().toISOString() });
      }
      return res.json({ ok: true, type: t });
    }
    state.interactions.push({ _id: nid('ix'), userId: String(req.userId), articleId: String(articleId), type: t, duration, createdAt: new Date().toISOString() });
    res.json({ ok: true, type: t });
  } catch (err) { next(err); }
}

async function userInteractions(userId) {
  await ensureSeeded();
  if (isConnected()) {
    return Interaction.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  return state.interactions
    .filter(i => String(i.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function mystate(req, res, next) {
  try {
    const all = await userInteractions(req.userId);
    const liked = [...new Set(all.filter(i => i.type === 'LIKE').map(i => String(i.articleId)))];
    const saved = [...new Set(all.filter(i => i.type === 'SAVE').map(i => String(i.articleId)))];
    const skipped = [...new Set(all.filter(i => i.type === 'SKIP').map(i => String(i.articleId)))];
    res.json({ liked, saved, skipped });
  } catch (err) { next(err); }
}

async function history(req, res, next) {
  try {
    const all = await userInteractions(req.userId);
    const views = all.filter(i => ['VIEW', 'OPEN'].includes(i.type));
    // most recent per article
    const seen = new Map();
    for (const v of views) {
      const k = String(v.articleId);
      if (!seen.has(k)) seen.set(k, v);
    }
    res.json({ history: [...seen.values()] });
  } catch (err) { next(err); }
}

async function clearHistory(req, res, next) {
  try {
    await ensureSeeded();
    if (isConnected()) {
      await Interaction.deleteMany({ userId: req.userId, type: { $in: ['VIEW', 'OPEN'] } });
    } else {
      state.interactions = state.interactions.filter(
        i => !(String(i.userId) === String(req.userId) && ['VIEW', 'OPEN'].includes(i.type))
      );
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { record, mystate, history, clearHistory, userInteractions };
