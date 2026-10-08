const express = require('express');
const { summary, ask, askChecks } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/summary/:id', optionalAuth, summary);
router.post('/ask', optionalAuth, askChecks, ask);

module.exports = router;
