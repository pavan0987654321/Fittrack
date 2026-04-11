const express = require('express');
const router = express.Router();
const {
  getPayments, getPayment, createPayment, updatePayment, deletePayment, getPaymentStats,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, getPaymentStats);
router.get('/', protect, getPayments);
router.get('/:id', protect, getPayment);
router.post('/', protect, adminOnly, createPayment);
router.put('/:id', protect, adminOnly, updatePayment);
router.delete('/:id', protect, adminOnly, deletePayment);

module.exports = router;
