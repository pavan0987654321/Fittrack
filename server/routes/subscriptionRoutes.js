const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getPendingCount,
  getMyRequests,
  approveRequest,
  rejectRequest,
} = require('../controllers/subscriptionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Member routes
router.post('/request', protect, createRequest);
router.get('/my', protect, getMyRequests);

// Admin routes
router.get('/pending-count', protect, adminOnly, getPendingCount);
router.get('/', protect, adminOnly, getAllRequests);
router.patch('/:id/approve', protect, adminOnly, approveRequest);
router.patch('/:id/reject', protect, adminOnly, rejectRequest);

module.exports = router;
