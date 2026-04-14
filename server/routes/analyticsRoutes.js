const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get advanced dashboard analytics
router.get('/', protect, adminOnly, getAnalytics);

module.exports = router;
