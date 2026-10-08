const express = require('express');
const { list, getOne, categories } = require('../controllers/articleController');
const { context } = require('../controllers/contextController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/', list);
router.get('/categories', categories);
router.get('/:id/context', optionalAuth, context);
router.get('/:id', getOne);

module.exports = router;
