const express = require('express');
const router = express.Router();
const {
  addProgress, getProgress, getMyProgress, deleteProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyProgress);
router.get('/:memberId', protect, getProgress);
router.post('/', protect, addProgress);
router.delete('/:id', protect, deleteProgress);

module.exports = router;
