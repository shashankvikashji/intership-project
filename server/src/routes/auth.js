const express = require('express');
const { register, login, me, registerChecks, loginChecks } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/register', registerChecks, register);
router.post('/login', loginChecks, login);
router.get('/me', requireAuth, me);

module.exports = router;
