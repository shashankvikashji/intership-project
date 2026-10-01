// npm run seed — fills MongoDB (if configured) or prints the memory-seed summary.
const { connectDB, isConnected } = require('./config/db');

async function main() {
  await connectDB();
  const { articles } = require('./data/seedArticles');
  if (isConnected()) {
    const Article = require('./models/Article');
    const User = require('./models/User');
    await Article.deleteMany({});
    await Article.insertMany(articles);
    console.log(`Seeded ${articles.length} articles into MongoDB`);
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('demo1234', 10);
    await User.findOneAndUpdate(
      { email: 'demo@lumen.news' },
      { name: 'Shashank', email: 'demo@lumen.news', password: hash, interests: ['AI', 'Programming', 'Technology', 'Startups'] },
      { upsert: true }
    );
    console.log('Ensured demo user demo@lumen.news / demo1234');
    process.exit(0);
  } else {
    console.log(`No MONGO_URI — memory store will seed ${articles.length} articles on boot. Nothing to do.`);
    process.exit(0);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
