// Content-based recommendation engine. Honest, explainable scoring —
// no claim of deep ML. Weights are configurable in one place.
const WEIGHTS = {
  interest: 3.0,      // explicit interests selected in preferences
  category: 2.2,      // category overlap with liked/saved/read
  tag: 2.0,           // tag overlap
  keyword: 1.4,       // title+description keyword overlap (tf-lite)
  liked: 2.5,         // similarity to liked articles
  saved: 2.0,         // similarity to saved articles
  recency: 1.0,       // fresher articles get a small boost
  readPenalty: -4.0,  // already read -> push down (not hide, keeps history usable)
  skipPenalty: -10.0  // explicitly skipped -> effectively exclude
};

function tokens(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

const STOP = new Set([
  'the','and','for','with','are','from','that','this','you','your','has','have',
  'will','was','were','been','about','into','more','than','its','they','them',
  'what','when','how','why','can','our','out','new','who','whom','which','their',
  'there','these','those','while','after','before','between','during','over',
  'under','again','once','here','both','each','few','other','some','such'
]);

function termFreq(tokArr) {
  const m = new Map();
  tokArr.forEach(t => m.set(t, (m.get(t) || 0) + 1));
  return m;
}

// Cosine similarity over raw term-frequency vectors.
function cosine(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const fa = termFreq(aTokens);
  const fb = termFreq(bTokens);
  let dot = 0;
  for (const [t, c] of fa) if (fb.has(t)) dot += c * fb.get(t);
  const mag = v => Math.sqrt([...v.values()].reduce((s, c) => s + c * c, 0));
  const denom = mag(fa) * mag(fb);
  return denom === 0 ? 0 : dot / denom;
}

function articleText(a) {
  return `${a.title || ''} ${a.description || ''} ${(a.tags || []).join(' ')} ${a.category || ''}`;
}

function recencyScore(publishedAt) {
  const ageH = (Date.now() - new Date(publishedAt).getTime()) / 3600e3;
  if (Number.isNaN(ageH)) return 0;
  // Half-life ~72h: fresh stories get up to 1 point, week-old ~0.1
  return Math.exp(-ageH / 72);
}

function jaccard(a = [], b = []) {
  const A = new Set(a.map(String).map(s => s.toLowerCase()));
  const B = new Set(b.map(String).map(s => s.toLowerCase()));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

function calculateContentSimilarity(a, b) {
  const cat = a.category === b.category ? 1 : 0;
  const tag = jaccard(a.tags || [], b.tags || []);
  const kw = cosine(tokens(articleText(a)), tokens(articleText(b)));
  return { cat, tag, kw, combined: 0.45 * cat + 0.3 * tag + 0.25 * kw };
}

function calculateInterestSimilarity(article, interests = []) {
  if (!interests.length) return 0;
  const pool = interests.map(String);
  const catHit = pool.some(i => i.toLowerCase() === String(article.category || '').toLowerCase()) ? 1 : 0;
  const tagHit = jaccard(article.tags || [], pool);
  const kwHit = cosine(tokens(articleText(article)), tokens(pool.join(' ')));
  return 0.5 * catHit + 0.3 * tagHit + 0.2 * kwHit;
}

function calculateArticleScore(article, profile) {
  // profile: { interests, likedArticles:Set/Map of article objs, savedArticles, historyArticles, skipped:Set }
  const reasons = [];
  let score = 0;

  const interestSim = calculateInterestSimilarity(article, profile.interests);
  score += WEIGHTS.interest * interestSim;
  if (interestSim > 0.25) reasons.push(`Matches your interest in ${article.category}`);

  const histPool = [...profile.likedArticles, ...profile.savedArticles, ...profile.historyArticles].slice(-30);
  let bestCat = 0, bestTag = 0, bestKw = 0, bestRef = null;
  const aTok = tokens(articleText(article));
  for (const ref of histPool) {
    if (String(ref._id) === String(article._id)) continue;
    const sim = calculateContentSimilarity(article, ref);
    const likedBoost = profile.likedIds.has(String(ref._id)) ? 1.25 : 1;
    const savedBoost = profile.savedIds.has(String(ref._id)) ? 1.15 : 1;
    const combined = sim.combined * likedBoost * savedBoost;
    if (combined > bestCat * 0.45 + bestTag * 0.3 + bestKw * 0.25) {
      bestCat = sim.cat; bestTag = sim.tag; bestKw = sim.kw; bestRef = ref;
    }
  }
  const histSim = 0.45 * bestCat + 0.3 * bestTag + 0.25 * bestKw;
  score += WEIGHTS.category * bestCat * 0.6 + WEIGHTS.tag * bestTag + WEIGHTS.keyword * bestKw;
  if (bestRef && histSim > 0.18) {
    reasons.push(
      profile.savedIds.has(String(bestRef._id))
        ? 'Similar to stories you saved'
        : profile.likedIds.has(String(bestRef._id))
          ? 'Similar to stories you liked'
          : 'Because you read similar stories'
    );
  }

  const rec = recencyScore(article.publishedAt);
  score += WEIGHTS.recency * rec;

  if (profile.readIds.has(String(article._id))) {
    score += WEIGHTS.readPenalty;
    reasons.push('Already read');
  }
  if (profile.skipIds.has(String(article._id))) {
    score += WEIGHTS.skipPenalty;
    reasons.push('Marked not interested');
  }

  return { score, reasons: reasons.slice(0, 2), parts: { interestSim, histSim, recency: rec } };
}

function rankArticles(allArticles, profile, opts = {}) {
  const { limit = 20, excludeIds = new Set(), diversity = true } = opts;
  const scored = [];
  for (const a of allArticles) {
    if (excludeIds.has(String(a._id))) continue;
    if (profile.skipIds.has(String(a._id))) continue; // hard-exclude skips
    const { score, reasons } = calculateArticleScore(a, profile);
    scored.push({ article: a, score, reason: reasons[0] || '' });
  }
  scored.sort((x, y) => y.score - x.score);

  if (!diversity) return scored.slice(0, limit);

  // 75% exploitation / 25% exploration: cap to max 3 per category in top picks,
  // then fill the tail with newest unseen from under-represented categories.
  const RELEVANT_SHARE = 0.75;
  const nRelevant = Math.max(1, Math.round(limit * RELEVANT_SHARE));
  const picked = [];
  const perCat = new Map();
  for (const s of scored) {
    if (picked.length >= nRelevant) break;
    const c = s.article.category || 'Other';
    if ((perCat.get(c) || 0) >= 3) continue;
    picked.push(s);
    perCat.set(c, (perCat.get(c) || 0) + 1);
  }
  if (picked.length < limit) {
    const pickedIds = new Set(picked.map(p => String(p.article._id)));
    const rest = scored
      .filter(s => !pickedIds.has(String(s.article._id)))
      .sort((a, b) => new Date(b.article.publishedAt) - new Date(a.article.publishedAt));
    for (const s of rest) {
      if (picked.length >= limit) break;
      picked.push({ ...s, reason: s.reason || 'Outside your usual feed' });
    }
  }
  return picked;
}

function relatedArticles(article, allArticles, n = 5) {
  return allArticles
    .filter(a => String(a._id) !== String(article._id))
    .map(a => ({ article: a, sim: calculateContentSimilarity(article, a).combined }))
    .sort((x, y) => y.sim - x.sim)
    .slice(0, n)
    .map(({ article: a, sim }) => ({ article: a, score: sim }));
}

module.exports = {
  WEIGHTS,
  tokens,
  cosine,
  calculateContentSimilarity,
  calculateInterestSimilarity,
  calculateArticleScore,
  rankArticles,
  relatedArticles,
  recencyScore
};
