const User = require('../models/User');
const { isConnected } = require('../config/db');
const { state, ensureSeeded } = require('../services/store');
const { allArticles } = require('./articleController');
const { allInteractions } = require('./trendingController');
const { gnewsApiKey } = require('../services/newsService');
const env = require('../config/env');

// GET /api/admin/stats — read-only operational metrics.
async function stats(req, res, next) {
  try {
    await ensureSeeded();
    const [articles, interactions] = await Promise.all([allArticles(), allInteractions()]);
    let users = [];
    if (isConnected()) users = await User.find({}).lean();
    else users = state.users;

    const countType = t => interactions.filter(i => i.type === t).length;
    const catViews = {};
    const byId = new Map(articles.map(a => [String(a._id), a]));
    for (const i of interactions) {
      if (!['VIEW', 'OPEN'].includes(i.type)) continue;
      const a = byId.get(String(i.articleId));
      if (!a) continue;
      catViews[a.category] = (catViews[a.category] || 0) + 1;
    }
    const topCategories = Object.entries(catViews)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const articleViews = {};
    for (const i of interactions) {
      if (!['VIEW', 'OPEN'].includes(i.type)) continue;
      const k = String(i.articleId);
      articleViews[k] = (articleViews[k] || 0) + 1;
    }
    const topArticles = Object.entries(articleViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, views]) => {
        const a = byId.get(id);
        return { _id: id, title: a ? a.title : '(removed)', category: a ? a.category : '', views };
      });

    res.json({
      users: {
        total: users.length,
        recent: users
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(u => ({ name: u.name, email: u.email, createdAt: u.createdAt }))
      },
      articles: { total: articles.length },
      engagement: {
        views: countType('VIEW') + countType('OPEN'),
        likes: countType('LIKE'),
        bookmarks: countType('SAVE'),
        shares: countType('SHARE')
      },
      topCategories,
      topArticles,
      news: {
        provider: gnewsApiKey() ? 'gnews' : 'seed-fallback',
        configured: Boolean(gnewsApiKey()),
        demoMode: env.demoMode
      }
    });
  } catch (err) { next(err); }
}

module.exports = { stats };
