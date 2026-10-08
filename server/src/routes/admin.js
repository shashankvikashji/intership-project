const express = require('express');
const { stats } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
router.get('/stats', requireAuth, requireAdmin, stats);

module.exports = router;
