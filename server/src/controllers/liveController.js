// Live news endpoint (GNews provider). The API key never leaves the server:
// the browser calls /api/live and this controller attaches the key upstream.
const { fetchGNews, gnewsApiKey, GNEWS_CATEGORIES } = require('../services/newsService');
const { ensureSeeded, state } = require('../services/store');

const LABELS = GNEWS_CATEGORIES.map(c => c.charAt(0).toUpperCase() + c.slice(1));

function seedFallback({ category, q, page, pageSize }) {
  let items = [...state.articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  if (category && category.toLowerCase() !== 'general') {
    items = items.filter(a => String(a.category).toLowerCase() === String(category).toLowerCase());
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    items = items.filter(a =>
      `${a.title} ${a.description} ${a.category} ${a.source}`.toLowerCase().includes(needle)
    );
  }
  const total = items.length;
  const slice = items.slice((page - 1) * pageSize, page * pageSize);
  return { articles: slice, total };
}

async function live(req, res, next) {
  try {
    await ensureSeeded();
    const { category = 'General', q = '', page = '1', pageSize = '12' } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(25, Math.max(1, parseInt(pageSize, 10) || 12));

    if (!gnewsApiKey()) {
      // No key configured: stay functional with local stories so the page
      // works out of the box; the client shows a "demo data" notice.
      const { articles, total } = seedFallback({ category, q, page: p, pageSize: size });
      return res.json({
        articles, total, page: p, source: 'seed', configured: false,
        fetchedAt: new Date().toISOString(), categories: LABELS
      });
    }

    try {
      const { articles, total, cached, stale, fetchedAt } = await fetchGNews({
        category, q, page: p, pageSize: size, ignoreCache: req.query.fresh === '1'
      });
      // Headline browsing is newest-first. Search keeps relevance order.
      const ordered = (q && q.trim())
        ? articles
        : [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      return res.json({
        articles: ordered, total, page: p, source: 'gnews', configured: true,
        cached, stale: !!stale, fetchedAt, categories: LABELS
      });
    } catch (err) {
      if (err.code === 'UPSTREAM_DOWN' || err.code === 'UPSTREAM_ERROR') {
        const limited = err.status === 429;
        return res.status(limited ? 429 : 502).json({
          error: err.message, configured: true, rateLimited: limited, categories: LABELS
        });
      }
      throw err;
    }
  } catch (err) { next(err); }
}

module.exports = { live };
