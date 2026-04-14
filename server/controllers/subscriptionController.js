const SubscriptionRequest = require('../models/SubscriptionRequest');
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Member creates a subscription request
// @route   POST /api/subscriptions/request
// @access  Private (member)
const createRequest = async (req, res) => {
  try {
    const { planId, phone, preferredDate, preferredTime, message } = req.body;

    // Resolve or auto-create member record by email
    let memberRecord = await Member.findOne({ email: req.user.email });
    if (!memberRecord) {
      // Auto-create a basic Member document for this user the first time they subscribe
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required to create your member profile.' });
      }
      memberRecord = await Member.create({
        name:  req.user.name,
        email: req.user.email,
        phone,
        status: 'active',
      });
    }

    // Verify plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if there's already a pending request for this member+plan
    const existing = await SubscriptionRequest.findOne({
      memberId: memberRecord._id,
      planId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this plan.' });
    }

    const request = await SubscriptionRequest.create({
      memberId: memberRecord._id,
      planId,
      name: req.user.name,
      phone: phone || memberRecord.phone,
      preferredDate,
      preferredTime,
      message,
    });

    const populated = await SubscriptionRequest.findById(request._id)
      .populate('planId', 'name price duration')
      .populate('memberId', 'name email phone');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating request', error: error.message });
  }
};


// @desc    Get all subscription requests (admin)
// @route   GET /api/subscriptions
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const requests = await SubscriptionRequest.find(query)
      .populate('planId', 'name price duration')
      .populate('memberId', 'name email phone status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SubscriptionRequest.countDocuments(query);
    res.json({ requests, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending count (for admin badge)
// @route   GET /api/subscriptions/pending-count
// @access  Private/Admin
const getPendingCount = async (req, res) => {
  try {
    const count = await SubscriptionRequest.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my own subscription requests (member)
// @route   GET /api/subscriptions/my
// @access  Private (member)
const getMyRequests = async (req, res) => {
  try {
    const memberRecord = await Member.findOne({ email: req.user.email });
    if (!memberRecord) return res.json([]);

    const requests = await SubscriptionRequest.find({ memberId: memberRecord._id })
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a subscription request
// @route   PATCH /api/subscriptions/:id/approve
// @access  Private/Admin
const approveRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findById(req.params.id)
      .populate('planId', 'name price duration');

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    const plan = request.planId;
    const durationMonths = plan.duration || 1;

    // Calculate expiry
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    // Update member: assign plan + expiry + activate
    await Member.findByIdAndUpdate(request.memberId, {
      $set: {
        membershipPlan: plan._id,
        expiryDate,
        status: 'active',
      },
    });

    // Create payment record (cash, paid — offline payment simulation)
    await Payment.create({
      memberId: request.memberId,
      planId: plan._id,
      amount: plan.price,
      date: new Date(),
      dueDate: expiryDate,
      status: 'paid',
      paymentMethod: 'cash',
      notes: `Offline enrollment via subscription request #${request._id}`,
    });

    // Update request status
    await SubscriptionRequest.findByIdAndUpdate(request._id, {
      $set: {
        status: 'approved',
        approvedAt: new Date()
      }
    });

    // Create Notification for the user
    const member = await Member.findById(request.memberId);
    if (member) {
      const user = await User.findOne({ email: member.email });
      if (user) {
        await Notification.create({
          userId: user._id,
          message: `Your subscription to "${plan.name}" has been approved! It expires on ${expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
          type: 'success',
        });
      }
    }

    const updated = await SubscriptionRequest.findById(request._id)
      .populate('planId', 'name price duration')
      .populate('memberId', 'name email phone status');

    res.json({ message: 'Request approved successfully', request: updated });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ message: error.message || 'Server error', error: error.message });
  }
};

// @desc    Reject a subscription request
// @route   PATCH /api/subscriptions/:id/reject
// @access  Private/Admin
const rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await SubscriptionRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.rejectionReason = reason || '';
    await request.save();

    const updated = await SubscriptionRequest.findById(request._id)
      .populate('planId', 'name price duration')
      .populate('memberId', 'name email phone status');

    res.json({ message: 'Request rejected', request: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getPendingCount,
  getMyRequests,
  approveRequest,
  rejectRequest,
};
