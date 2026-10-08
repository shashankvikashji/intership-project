const express = require('express');
const { live } = require('../controllers/liveController');

const router = express.Router();

// GET /api/live?category=Technology&q=ai&page=1&pageSize=12
router.get('/', live);

module.exports = router;
