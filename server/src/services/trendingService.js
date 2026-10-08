// Trending: ranks articles by real engagement signals instead of recency alone.
//
//   trendingScore = views + 2*likes + 2*saves + 3*shares + recencyBoost
//
// recencyBoost decays exponentially (48h half-life, scaled to ~10 points)
// so fresh stories surface while proven engagement still counts.
// Works against both MongoDB and the in-memory demo store.
const ENGAGEMENT_WEIGHTS = { VIEW: 1, OPEN: 1, LIKE: 2, SAVE: 2, SHARE: 3 };

function recencyBoost(publishedAt) {
  const ageH = (Date.now() - new Date(publishedAt).getTime()) / 3600e3;
  if (!Number.isFinite(ageH) || ageH < 0) return 0;
  return 10 * Math.exp(-ageH / 48);
}

function scoreArticles(articles, interactions) {
  const counts = new Map(); // articleId -> { views, likes, saves, shares }
  for (const i of interactions) {
    const w = ENGAGEMENT_WEIGHTS[String(i.type).toUpperCase()];
    if (!w) continue; // SKIP/UN* markers don't make things trend
    const k = String(i.articleId);
    if (!counts.has(k)) counts.set(k, { views: 0, likes: 0, saves: 0, shares: 0 });
    const c = counts.get(k);
    if (i.type === 'LIKE') c.likes += 1;
    else if (i.type === 'SAVE') c.saves += 1;
    else if (i.type === 'SHARE') c.shares += 1;
    else c.views += 1;
  }
  return articles.map(a => {
    const c = counts.get(String(a._id)) || { views: 0, likes: 0, saves: 0, shares: 0 };
    const engagement = c.views + 2 * c.likes + 2 * c.saves + 3 * c.shares;
    const boost = recencyBoost(a.publishedAt);
    return { article: a, counts: c, engagement, boost, score: engagement + boost };
  }).sort((x, y) => y.score - x.score);
}

module.exports = { ENGAGEMENT_WEIGHTS, recencyBoost, scoreArticles };
