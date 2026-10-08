const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const liveRoutes = require('./routes/live');
const recRoutes = require('./routes/recommendations');
const interactionRoutes = require('./routes/interactions');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const trendingRoutes = require('./routes/trending');
const adminRoutes = require('./routes/admin');

function createApp() {
  const app = express();
  // Allow the configured client plus any localhost port (dev servers often
  // shift ports when the default is taken, e.g. 5173 -> 5174).
  const localhostRe = /^http:\/\/localhost:\d+$/;
  const allowedOrigins = new Set([env.clientUrl, 'http://localhost:5173', 'http://localhost:3000']);
  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https:']
      }
    }
  }));
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.has(origin) || localhostRe.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ ok: true, demo: env.demoMode, time: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/live', liveRoutes);
  app.use('/api/recommendations', recRoutes);
  app.use('/api/interactions', interactionRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/trending', trendingRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
