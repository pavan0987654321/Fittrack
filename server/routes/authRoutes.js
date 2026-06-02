const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, demoLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',    register);
router.post('/login',       login);
router.post('/demo-login',  demoLogin);   // ← new: returns fake data, no DB access
router.get('/me',  protect, getMe);
router.put('/me',  protect, updateProfile);

module.exports = router;
