const User = require('../models/User');
const { isConnected } = require('../config/db');
const { state, ensureSeeded, publicUser } = require('../services/store');
const { allArticles, findArticle } = require('./articleController');
const { userInteractions } = require('./interactionController');
const { rankArticles, relatedArticles, calculateArticleScore } = require('../services/recommendationService');

async function findUser(userId) {
  await ensureSeeded();
  if (isConnected()) return User.findById(userId).lean();
  return state.users.find(u => String(u._id) === String(userId)) || null;
}

async function buildProfile(userId) {
  const user = await findUser(userId);
  const articles = await allArticles();
  const byId = new Map(articles.map(a => [String(a._id), a]));
  const interactions = userId ? await userInteractions(userId) : [];

  const idsOf = t => new Set(interactions.filter(i => i.type === t).map(i => String(i.articleId)));
  const likedIds = idsOf('LIKE');
  const savedIds = idsOf('SAVE');
  const skipIds = idsOf('SKIP');
  const readIds = new Set(
    interactions.filter(i => ['VIEW', 'OPEN'].includes(i.type)).map(i => String(i.articleId))
  );
  const pick = s => [...s].map(id => byId.get(id)).filter(Boolean);

  return {
    user,
    articles,
    byId,
    interests: (user && user.interests) || [],
    likedIds, savedIds, skipIds, readIds,
    likedArticles: pick(likedIds),
    savedArticles: pick(savedIds),
    historyArticles: pick(readIds)
  };
}

async function feed(req, res, next) {
  try {
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const profile = await buildProfile(req.userId);
    const ranked = rankArticles(profile.articles, profile, { limit });
    res.json({
      articles: ranked.map(r => r.article),
      reasons: Object.fromEntries(ranked.map(r => [String(r.article._id), r.reason])),
      scores: Object.fromEntries(ranked.map(r => [String(r.article._id), Number(r.score.toFixed(3))])),
      personalized: Boolean(profile.user && (profile.interests.length || profile.historyArticles.length))
    });
  } catch (err) { next(err); }
}

async function forArticle(req, res, next) {
  try {
    const article = await findArticle(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const profile = await buildProfile(req.userId || null);
    const related = relatedArticles(article, profile.articles, 5);
    // annotate with a score + light personalization note
    const annotated = related.map(({ article: a, score }) => {
      let note = '';
      if (req.userId) {
        const { reasons } = calculateArticleScore(a, profile);
        note = reasons[0] || '';
      }
      return { article: a, score: Number(score.toFixed(3)), reason: note };
    });
    res.json({ articles: annotated.map(x => x.article), reasons: Object.fromEntries(annotated.map(x => [String(x.article._id), x.reason])) });
  } catch (err) { next(err); }
}

module.exports = { feed, forArticle, buildProfile };
