const Member = require('../models/Member');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
  try {
    const { status, search, trainerAssigned, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (trainerAssigned) query.trainerAssigned = trainerAssigned;

    const members = await Member.find(query)
      .populate('membershipPlan', 'name price duration')
      .populate('trainerAssigned', 'name specialty')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Member.countDocuments(query);
    res.json({ members, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('membershipPlan', 'name price duration')
      .populate('trainerAssigned', 'name specialty phone');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create member
// @route   POST /api/members
// @access  Private/Admin
const createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error creating member', error: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error updating member', error: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get member stats
// @route   GET /api/members/stats
// @access  Private
const getMemberStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ status: 'active' });
    const inactive = await Member.countDocuments({ status: 'inactive' });
    const expired = await Member.countDocuments({ status: 'expired' });
    res.json({ total, active, inactive, expired });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMembers, getMember, createMember, updateMember, deleteMember, getMemberStats };
