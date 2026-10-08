// In-memory fallback store so the app runs without MongoDB.
// When Mongo is connected, controllers use Mongoose models directly.
// Otherwise they use this store. Shape mirrors the Mongoose schemas.
const bcrypt = require('bcryptjs');
const { articles: seedArticles } = require('../data/seedArticles');

const state = {
  users: [],        // { _id, name, email, password(hash), interests, ... }
  articles: [],    // { _id, ... }
  interactions: [],// { _id, userId, articleId, type, duration, createdAt }
  seq: 1
};

function nid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${state.seq++}`;
}

function readingMinutes(text = '') {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function ensureSeeded() {
  if (state.articles.length > 0) return;
  state.articles = seedArticles.map((a, i) => ({
    _id: `art_seed_${i + 1}`,
    ...a,
    author: a.author || '',
    readingMinutes: readingMinutes(`${a.title} ${a.description} ${a.content}`),
    createdAt: a.publishedAt
  }));
  // Demo user: demo@lumen.news / demo1234
  const hash = await bcrypt.hash('demo1234', 10);
  if (!state.users.find(u => u.email === 'demo@lumen.news')) {
    state.users.push({
      _id: 'user_demo_1',
      name: 'Shashank',
      email: 'demo@lumen.news',
      password: hash,
      avatar: '',
      interests: ['AI', 'Programming', 'Technology', 'Startups'],
      preferredTopics: [],
      language: 'en',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

module.exports = { state, nid, ensureSeeded, publicUser, readingMinutes };
