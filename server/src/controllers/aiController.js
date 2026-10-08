const { body, validationResult } = require('express-validator');
const { findArticle } = require('./articleController');
const { summarizeArticle, answerQuestion, providerConfigured } = require('../services/aiService');

const askChecks = [
  body('articleId').notEmpty().withMessage('articleId is required'),
  body('question').trim().isLength({ min: 3, max: 500 }).withMessage('Question must be 3–500 characters')
];

async function summary(req, res, next) {
  try {
    const article = await findArticle(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const payload = await summarizeArticle(article);
    res.json({ ...payload, aiAvailable: providerConfigured() });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function ask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const article = await findArticle(req.body.articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const payload = await answerQuestion(article, req.body.question);
    res.json({ ...payload, aiAvailable: providerConfigured() });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { summary, ask, askChecks };
