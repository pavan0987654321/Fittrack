const express = require('express');
const router = express.Router();
const {
  getTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer,
} = require('../controllers/trainerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getTrainers);
router.get('/:id', protect, getTrainer);
router.post('/', protect, adminOnly, createTrainer);
router.put('/:id', protect, adminOnly, updateTrainer);
router.delete('/:id', protect, adminOnly, deleteTrainer);

module.exports = router;
