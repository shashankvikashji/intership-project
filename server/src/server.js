const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const { ensureSeeded } = require('./services/store');
const Article = require('./models/Article');
const User = require('./models/User');
const { isConnected } = require('./config/db');

async function seedMongoIfEmpty() {
  if (!isConnected()) return;
  const count = await Article.countDocuments();
  if (count > 0) return;
  const { articles } = require('./data/seedArticles');
  await Article.insertMany(articles.map(a => ({ ...a })));
  console.log(`[seed] inserted ${articles.length} articles into MongoDB`);
  const bcrypt = require('bcryptjs');
  const existing = await User.findOne({ email: 'demo@lumen.news' });
  if (!existing) {
    const hash = await bcrypt.hash('demo1234', 10);
    await User.create({ name: 'Shashank', email: 'demo@lumen.news', password: hash, interests: ['AI', 'Programming', 'Technology', 'Startups'] });
    console.log('[seed] created demo user demo@lumen.news / demo1234');
  }
}

async function main() {
  await ensureSeeded();
  await connectDB();
  await seedMongoIfEmpty();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[lumen] API listening on http://localhost:${env.port}`);
    console.log(`[lumen] demo login: demo@lumen.news / demo1234`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
