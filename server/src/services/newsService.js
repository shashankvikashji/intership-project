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

module.exports = { normalizeNewsApiItem, guessCategory, fetchFromProvider };
