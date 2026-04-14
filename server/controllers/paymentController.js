const Payment = require('../models/Payment');
const Member = require('../models/Member');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const { status, memberId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;

    const payments = await Payment.find(query)
      .populate('memberId', 'name email phone')
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);
    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('memberId', 'name email phone')
      .populate('planId', 'name price');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create payment
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    if (payment.status === 'paid' && payment.memberId) {
      const member = await Member.findById(payment.memberId);
      if (member) {
        const user = await User.findOne({ email: member.email });
        if (user) {
          await Notification.create({
            userId: user._id,
            message: `A payment of ₹${payment.amount} has been successfully recorded.`,
            type: 'success',
          });
        }
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating payment', error: error.message });
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePayment = async (req, res) => {
  try {
    const originalPayment = await Payment.findById(req.params.id);
    const wasPaid = originalPayment?.status === 'paid';

    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (!wasPaid && payment.status === 'paid' && payment.memberId) {
      const member = await Member.findById(payment.memberId);
      if (member) {
        const user = await User.findOne({ email: member.email });
        if (user) {
          await Notification.create({
            userId: user._id,
            message: `Your payment of ₹${payment.amount} has been successfully updated to Paid.`,
            type: 'success',
          });
        }
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating payment', error: error.message });
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment stats (revenue summary)
// @route   GET /api/payments/stats
// @access  Private
const getPaymentStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pending = await Payment.countDocuments({ status: 'pending' });
    const paid = await Payment.countDocuments({ status: 'paid' });
    const overdue = await Payment.countDocuments({ status: 'overdue' });

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      pending,
      paid,
      overdue,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPayments, getPayment, createPayment, updatePayment, deletePayment, getPaymentStats };
