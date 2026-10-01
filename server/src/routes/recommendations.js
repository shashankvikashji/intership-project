const express = require('express');
const { feed, forArticle } = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/feed', optionalAuth, feed);
router.get('/related/:id', optionalAuth, forArticle);

module.exports = router;
