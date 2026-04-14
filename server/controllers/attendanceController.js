const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// Helper: get today as YYYY-MM-DD in IST
function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'en-CA' gives YYYY-MM-DD
}

// ── Helper: resolve memberId from User ────────────────────────────────────────
async function resolveMemberId(user) {
  const record = await Member.findOne({ email: user.email });
  return record?._id || null;
}

// @desc    Mark attendance for today (member marks own; admin/trainer can mark for any member)
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
  try {
    const { memberId: bodyMemberId, status = 'present', date } = req.body;
    const targetDate = date || todayIST();

    let memberId = bodyMemberId;

    // If member is marking their own attendance, resolve via email
    if (!memberId) {
      if (req.user.role === 'member') {
        memberId = await resolveMemberId(req.user);
        if (!memberId) {
          return res.status(404).json({ message: 'Member profile not found. Request a plan first to create your profile.' });
        }
      } else {
        return res.status(400).json({ message: 'memberId is required' });
      }
    }

    // Try creating; if duplicate key → already marked today
    let record;
    try {
      record = await Attendance.create({ memberId, date: targetDate, status });
    } catch (err) {
      if (err.code === 11000) {
        // Already exists → update status instead
        record = await Attendance.findOneAndUpdate(
          { memberId, date: targetDate },
          { status },
          { new: true }
        );
        return res.json({ ...record.toObject(), updated: true });
      }
      throw err;
    }

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error marking attendance', error: error.message });
  }
};

// @desc    Get today's attendance status for the logged-in member
// @route   GET /api/attendance/today
// @access  Private (member)
const getTodayStatus = async (req, res) => {
  try {
    const memberId = await resolveMemberId(req.user);
    if (!memberId) return res.json({ status: null });

    const record = await Attendance.findOne({ memberId, date: todayIST() });
    res.json({ status: record?.status || null, date: todayIST(), record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance history for a specific member
// @route   GET /api/attendance/member/:id
// @access  Private
const getMemberAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, limit = 60 } = req.query;

    const query = { memberId: id };
    if (month && year) {
      // Filter by month YYYY-MM prefix
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      query.date = { $regex: `^${prefix}` };
    } else if (year) {
      query.date = { $regex: `^${year}` };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get MY attendance history
// @route   GET /api/attendance/me
// @access  Private (member)
const getMyAttendance = async (req, res) => {
  try {
    const memberId = await resolveMemberId(req.user);
    if (!memberId) return res.json([]);

    const { limit = 60 } = req.query;
    const records = await Attendance.find({ memberId })
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all attendance (admin/trainer view) — optionally filtered by date
// @route   GET /api/attendance
// @access  Private/Admin/Trainer
const getAllAttendance = async (req, res) => {
  try {
    const { date, memberId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (date) query.date = date;
    if (memberId) query.memberId = memberId;

    const records = await Attendance.find(query)
      .populate('memberId', 'name email phone')
      .sort({ date: -1, markedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(query);
    res.json({ records, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance stats for a member (total present, absent, streak)
// @route   GET /api/attendance/stats/:memberId
// @access  Private
const getAttendanceStats = async (req, res) => {
  try {
    const { memberId } = req.params;
    const present = await Attendance.countDocuments({ memberId, status: 'present' });
    const absent  = await Attendance.countDocuments({ memberId, status: 'absent' });

    // Calculate current streak (consecutive present days ending today)
    const allPresent = await Attendance.find({ memberId, status: 'present' })
      .sort({ date: -1 })
      .select('date');

    let streak = 0;
    let checkDate = new Date(todayIST());
    for (const rec of allPresent) {
      const recDate = rec.date;
      const expected = checkDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      if (recDate === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ present, absent, total: present + absent, streak });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  markAttendance,
  getTodayStatus,
  getMemberAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceStats,
};
