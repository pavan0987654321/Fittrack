const Progress = require('../models/Progress');
const Member = require('../models/Member');

// @desc    Add a progress entry (weight snapshot)
// @route   POST /api/progress
// @access  Private (member adds their own; admin/trainer can add for any)
const addProgress = async (req, res) => {
  try {
    const { memberId, weight, date, notes } = req.body;

    // Determine which member this is for
    let targetMemberId = memberId;
    if (!targetMemberId) {
      // If the caller is a member, resolve via their email
      if (req.user.role === 'member') {
        const memberRecord = await Member.findOne({ email: req.user.email });
        if (!memberRecord) {
          return res.status(404).json({ message: 'Member profile not found' });
        }
        targetMemberId = memberRecord._id;
      } else {
        return res.status(400).json({ message: 'memberId is required' });
      }
    }

    const entry = await Progress.create({
      memberId: targetMemberId,
      weight,
      date: date || new Date(),
      notes,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: 'Error adding progress', error: error.message });
  }
};

// @desc    Get progress for a member
// @route   GET /api/progress/:memberId
// @access  Private
const getProgress = async (req, res) => {
  try {
    const { memberId } = req.params;

    const entries = await Progress.find({ memberId })
      .sort({ date: 1 })
      .lean();

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get progress for the currently logged-in member
// @route   GET /api/progress/me
// @access  Private (member only)
const getMyProgress = async (req, res) => {
  try {
    const memberRecord = await Member.findOne({ email: req.user.email });
    if (!memberRecord) return res.status(404).json({ message: 'Member profile not found' });

    const entries = await Progress.find({ memberId: memberRecord._id })
      .sort({ date: 1 })
      .lean();

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a progress entry
// @route   DELETE /api/progress/:id
// @access  Private
const deleteProgress = async (req, res) => {
  try {
    await Progress.findByIdAndDelete(req.params.id);
    res.json({ message: 'Progress entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addProgress, getProgress, getMyProgress, deleteProgress };
