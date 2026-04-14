const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  checkExpiries
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.get('/', protect, getUserNotifications);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);

// Admin / System route
router.post('/check-expiries', protect, adminOnly, checkExpiries);

module.exports = router;
