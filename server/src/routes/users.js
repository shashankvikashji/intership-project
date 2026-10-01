const express = require('express');
const { getPreferences, savePreferences, updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.get('/preferences', requireAuth, getPreferences);
router.put('/preferences', requireAuth, savePreferences);
router.patch('/profile', requireAuth, updateProfile);

module.exports = router;
