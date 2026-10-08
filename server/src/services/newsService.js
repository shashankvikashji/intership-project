// Provider abstraction: normalized article fetching.
// Uses NEWS_API_KEY when present (NewsAPI.org), else local seed data.
const { state } = require('./store');

function normalizeNewsApiItem(item) {
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  const category = guessCategory(text);
  return {
    externalId: `newsapi_${Buffer.from(item.url || item.title || String(Date.now())).toString('base64').slice(0, 16)}`,
    title: item.title || 'Untitled',
    description: item.description || '',
    content: item.content || item.description || '',
    image: item.urlToImage || '',
    source: (item.source && item.source.name) || 'NewsAPI',
    url: item.url || '',
    category,
    tags: category ? [category.toLowerCase()] : [],
    author: item.author || '',
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

function guessCategory(text) {
  const rules = [
    ['AI', ['ai', 'artificial intelligence', 'llm', 'machine learning', 'openai']],
    ['Programming', ['javascript', 'typescript', 'react', 'python', 'code', 'developer', 'software']],
    ['Technology', ['tech', 'startup', 'gadget', 'apple', 'google', 'chip']],
    ['Business', ['market', 'startup', 'funding', 'business', 'economy', 'ceo']],
    ['Science', ['science', 'research', 'space', 'nasa', 'study']],
    ['Finance', ['stock', 'finance', 'invest', 'bank', 'crypto']],
    ['Sports', ['sport', 'match', 'league', 'cricket', 'football']],
    ['India', ['india', 'indian', 'ipl', 'rupee', 'bollywood', 'isro', 'upi']],
    ['Health', ['health', 'doctor', 'fitness', 'sleep']],
    ['Politics', ['election', 'minister', 'parliament', 'policy']],
    ['World', ['world', 'global', 'climate', 'war']],
    ['Entertainment', ['movie', 'film', 'music', 'show', 'streaming']],
    ['Gaming', ['game', 'gaming', 'playstation', 'xbox']],
    ['Education', ['school', 'college', 'university', 'learn', 'student']]
  ];
  for (const [cat, kws] of rules) {
    if (kws.some(k => text.includes(k))) return cat;
  }
  return 'World';
}

async function fetchFromProvider() {
  const key = process.env.NEWS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=40&apiKey=${key}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.articles || []).map(normalizeNewsApiItem);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GNews provider (https://gnews.io). Key is read ONLY here on the server —
// it is never sent to the browser. Free tier: ~100 req/day, so responses
// are cached in memory for 5 minutes per unique query.
// GNews categories: general, world, nation, business, technology,
// entertainment, sports, science, health.
const GNEWS_BASE = 'https://gnews.io/api/v4';
const GNEWS_CATEGORIES = ['general', 'technology', 'business', 'sports', 'science', 'health'];
const gnewsCache = new Map(); // cacheKey -> { at, payload }
const GNEWS_TTL_MS = 5 * 60 * 1000;

function gnewsApiKey() {
  return process.env.GNEWS_API_KEY || '';
}

function normalizeGNewsItem(item, fallbackCategory) {
  const sourceName = (item.source && item.source.name) || 'GNews';
  const seed = item.url || item.title || String(Date.now());
  return {
    _id: `gnews_${Buffer.from(seed).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
    externalId: `gnews_${seed}`.slice(0, 64),
    title: item.title || 'Untitled',
    description: item.description || '',
    content: item.content || item.description || '',
    image: item.image || '',
    source: sourceName,
    url: item.url || '',
    category: fallbackCategory || 'General',
    tags: [(fallbackCategory || 'general').toLowerCase()],
    author: sourceName,
    publishedAt: item.publishedAt || new Date().toISOString(),
    live: true
  };
}

function labelForGnewsCategory(c) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

async function fetchGNews({ category = 'general', q = '', page = 1, pageSize = 12, ignoreCache = false } = {}) {
  const key = gnewsApiKey();
  if (!key) {
    const err = new Error('GNEWS_API_KEY is not set');
    err.code = 'NO_KEY';
    throw err;
  }
  const cat = GNEWS_CATEGORIES.includes(String(category).toLowerCase())
    ? String(category).toLowerCase()
    : 'general';
  const max = Math.min(25, Math.max(1, parseInt(pageSize, 10) || 12));
  const p = Math.max(1, parseInt(page, 10) || 1);

  const cacheKey = `${cat}|${q}|${p}|${max}`;
  const hit = gnewsCache.get(cacheKey);
  if (!ignoreCache && hit && Date.now() - hit.at < GNEWS_TTL_MS) {
    return { ...hit.payload, cached: true, stale: false };
  }

  const params = new URLSearchParams({
    apikey: key,
    lang: 'en',
    country: 'us',
    max: String(max),
    page: String(p)
  });
  let path;
  if (q && q.trim()) {
    path = 'search';
    params.set('q', q.trim());
    // Search endpoint has no category filter; keep label for display only.
  } else {
    path = 'top-headlines';
    params.set('category', cat);
  }

  let res;
  try {
    res = await fetch(`${GNEWS_BASE}/${path}?${params.toString()}`);
  } catch (e) {
    const err = new Error('Could not reach GNews. Check your connection and retry.');
    err.code = 'UPSTREAM_DOWN';
    throw err;
  }
  if (!res.ok) {
    // Rate-limited but we have (possibly stale) data: serve it instead of
    // failing, so the page keeps working on the ~100 req/day free tier.
    // (401/403 = key problem: never mask those, always surface the error.)
    if (res.status === 429 && hit) {
      return { ...hit.payload, cached: true, stale: true };
    }
    const err = new Error(
      res.status === 401 || res.status === 403
        ? 'GNews rejected the API key. Check GNEWS_API_KEY in server/.env.'
        : res.status === 429
          ? 'GNews rate limit reached (free tier is ~100 requests/day). Try again later.'
          : `GNews request failed (HTTP ${res.status}).`
    );
    err.code = 'UPSTREAM_ERROR';
    err.status = res.status;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  const label = labelForGnewsCategory(cat);
  const articles = (data.articles || []).map(a => normalizeGNewsItem(a, label));
  const payload = {
    articles,
    total: data.totalArticles ?? articles.length,
    cached: false,
    stale: false,
    fetchedAt: new Date().toISOString()
  };
  gnewsCache.set(cacheKey, { at: Date.now(), payload });
  return payload;
}

module.exports = {
  normalizeNewsApiItem,
  guessCategory,
  fetchFromProvider,
  normalizeGNewsItem,
  fetchGNews,
  gnewsApiKey,
  GNEWS_CATEGORIES
};
