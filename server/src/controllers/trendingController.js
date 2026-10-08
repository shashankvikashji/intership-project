const Interaction = require('../models/Interaction');
const { isConnected } = require('../config/db');
const { state, ensureSeeded } = require('../services/store');
const { allArticles } = require('./articleController');
const { scoreArticles } = require('../services/trendingService');

async function allInteractions() {
  await ensureSeeded();
  if (isConnected()) return Interaction.find({}).lean();
  return state.interactions;
}

// GET /api/trending?limit=12 — engagement-ranked stories with score breakdown.
async function trending(req, res, next) {
  try {
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const articles = await allArticles();
    const interactions = await allInteractions();
    const ranked = scoreArticles(articles, interactions).slice(0, limit);
    res.json({
      articles: ranked.map(r => r.article),
      scores: Object.fromEntries(
        ranked.map(r => [String(r.article._id), {
          score: Number(r.score.toFixed(2)),
          views: r.counts.views, likes: r.counts.likes,
          saves: r.counts.saves, shares: r.counts.shares
        }])
      )
    });
  } catch (err) { next(err); }
}

module.exports = { trending, allInteractions };
