const express = require('express');
const router = express.Router();
const {
  getMembers, getMember, createMember, updateMember, deleteMember, getMemberStats,
} = require('../controllers/memberController');
const { protect, adminOnly, adminOrTrainer } = require('../middleware/authMiddleware');

router.get('/stats', protect, getMemberStats);
router.get('/', protect, getMembers);
router.get('/:id', protect, getMember);
router.post('/', protect, adminOrTrainer, createMember);
router.put('/:id', protect, adminOrTrainer, updateMember);
router.delete('/:id', protect, adminOnly, deleteMember);

module.exports = router;
