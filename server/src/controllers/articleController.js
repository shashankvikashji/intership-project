const Article = require('../models/Article');
const Interaction = require('../models/Interaction');
const { isConnected } = require('../config/db');
const { state, ensureSeeded } = require('../services/store');

function toClient(a) {
  const o = a.toObject ? a.toObject() : { ...a };
  return o;
}

async function allArticles() {
  await ensureSeeded();
  if (isConnected()) {
    const docs = await Article.find({}).sort({ publishedAt: -1 }).lean();
    if (docs.length) return docs;
  }
  return [...state.articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function findArticle(id) {
  await ensureSeeded();
  if (isConnected()) {
    try {
      const doc = await Article.findById(id).lean();
      if (doc) return doc;
    } catch { /* maybe seed-style id, fall through */ }
  }
  return state.articles.find(a => String(a._id) === String(id)) || null;
}

async function list(req, res, next) {
  try {
    const { category, search, page = '1', limit = '24', sort = 'newest' } = req.query;
    let items = await allArticles();

    if (category && category !== 'All') {
      items = items.filter(a => String(a.category).toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(a =>
        `${a.title} ${a.description} ${a.category} ${a.source} ${(a.tags || []).join(' ')}`.toLowerCase().includes(q)
      );
    }
    if (sort === 'oldest') items = [...items].reverse();

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 24));
    const total = items.length;
    const slice = items.slice((p - 1) * l, p * l);
    res.json({ articles: slice, total, page: p, pages: Math.max(1, Math.ceil(total / l)) });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const article = await findArticle(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ article: toClient(article) });
  } catch (err) { next(err); }
}

async function categories(req, res, next) {
  try {
    const items = await allArticles();
    const counts = {};
    items.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    res.json({ categories: Object.entries(counts).map(([name, count]) => ({ name, count })) });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, categories, allArticles, findArticle };
