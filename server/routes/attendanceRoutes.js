const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getTodayStatus,
  getMemberAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceStats,
} = require('../controllers/attendanceController');
const { protect, adminOrTrainer } = require('../middleware/authMiddleware');

// Member routes
router.get('/me', protect, getMyAttendance);
router.get('/today', protect, getTodayStatus);
router.post('/', protect, markAttendance);

// Stats
router.get('/stats/:memberId', protect, getAttendanceStats);

// Member history (accessible by admin, trainer, and the member themselves)
router.get('/member/:id', protect, getMemberAttendance);

// Admin / Trainer: all records
router.get('/', protect, adminOrTrainer, getAllAttendance);

module.exports = router;
