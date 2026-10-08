// Article context: topic cluster ("different coverage") + trust signals.
//
// Clustering is keyword/topic based: articles ranked by content similarity
// to the current one, keeping only those above a similarity floor so
// unrelated stories are never grouped. Trust status derives from actual
// signals — related-source count and article freshness — never a
// true/false verdict.
const { findArticle, allArticles } = require('./articleController');
const { relatedArticles, recencyScore } = require('../services/recommendationService');
const { extractiveSummary } = require('../services/aiService');

const SIMILARITY_FLOOR = 0.12;
const MAX_CLUSTER = 6;

function trustSignals(article, cluster) {
  const sources = new Set([article.source, ...cluster.map(a => a.source)].filter(Boolean));
  const ageH = (Date.now() - new Date(article.publishedAt).getTime()) / 3600e3;
  const freshness = Number.isFinite(ageH)
    ? ageH < 24 ? 'fresh' : ageH < 72 ? 'recent' : 'older'
    : 'unknown';
  // Status from real signals only.
  const status = sources.size >= 3 && ageH < 72
    ? 'well-supported'
    : sources.size >= 2
      ? 'limited'
      : 'insufficient';
  return {
    source: article.source || 'Unknown',
    sourceUrl: article.url || '',
    author: article.author || '',
    publishedAt: article.publishedAt,
    freshness,
    relatedCount: cluster.length,
    sourceCount: sources.size,
    status
  };
}

async function context(req, res, next) {
  try {
    const article = await findArticle(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const articles = await allArticles();
    const cluster = relatedArticles(article, articles, MAX_CLUSTER + 2)
      .filter(r => r.score >= SIMILARITY_FLOOR)
      .slice(0, MAX_CLUSTER)
      .map(r => r.article);

    // "Lumen summary" of the event: top extractive sentences of the main
    // article plus what the coverage shares (common category/tags).
    const ext = extractiveSummary(article, 3);
    const trust = trustSignals(article, cluster);
    res.json({
      cluster,
      trust,
      lumenSummary: ext ? ext.keyPoints : [],
      method: 'keyword/topic similarity — no unrelated stories grouped'
    });
  } catch (err) { next(err); }
}

module.exports = { context, SIMILARITY_FLOOR };
