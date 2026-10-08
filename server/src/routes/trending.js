const express = require('express');
const { trending } = require('../controllers/trendingController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/', optionalAuth, trending);

module.exports = router;
