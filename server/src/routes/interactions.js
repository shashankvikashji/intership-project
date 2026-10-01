const express = require('express');
const { record, mystate, history, clearHistory } = require('../controllers/interactionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/', requireAuth, record);
router.get('/mystate', requireAuth, mystate);
router.get('/history', requireAuth, history);
router.delete('/history', requireAuth, clearHistory);

module.exports = router;
