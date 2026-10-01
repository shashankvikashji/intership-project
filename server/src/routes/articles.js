const express = require('express');
const { list, getOne, categories } = require('../controllers/articleController');

const router = express.Router();
router.get('/', list);
router.get('/categories', categories);
router.get('/:id', getOne);

module.exports = router;
