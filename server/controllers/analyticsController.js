const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

// @desc    Get comprehensive analytics dashboard data
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const { timeframe = '30days' } = req.query; // '7days', '30days', '6months'
    
    // Determine the date filter range
    const now = new Date();
    const startDate = new Date();
    
    if (timeframe === '7days') startDate.setDate(now.getDate() - 7);
    else if (timeframe === '30days') startDate.setDate(now.getDate() - 30);
    else if (timeframe === '6months') startDate.setMonth(now.getMonth() - 6);
    else startDate.setDate(now.getDate() - 30); // Default to 30 days
    
    // 1. Member Stats
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'active', expiryDate: { $gte: now } });
    const inactiveMembers = totalMembers - activeMembers; // Approximating all non-active/expired here
    
    // Plan distribution specifically for active members
    const planAgg = await Member.aggregate([
      { $match: { status: 'active', expiryDate: { $gte: now } } },
      { $lookup: { from: 'plans', localField: 'membershipPlan', foreignField: '_id', as: 'planDetails' } },
      { $unwind: { path: '$planDetails', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$planDetails.name', count: { $sum: 1 } } }
    ]);
    const planDistribution = planAgg.map(p => ({
      name: p._id || 'No Plan',
      value: p.count
    }));

    // 2. Revenue Data (Filtered by timeframe)
    const totalRevenueAgg = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenueAllTime = totalRevenueAgg[0]?.total || 0;

    const timeframeRevenueAgg = await Payment.aggregate([
      { $match: { status: 'paid', date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenueTimeframe = timeframeRevenueAgg[0]?.total || 0;

    // Monthly Revenue Trend (for the last 6 months regardless of filter, or adjust based on filter)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid', date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const formattedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrend = monthlyRevenue.map(m => ({
      month: formattedMonths[m._id.month - 1],
      revenue: m.revenue
    }));

    // 3. Attendance Rate (Filtered by timeframe)
    const attQuery = { date: { $gte: startDate.toLocaleDateString('en-CA') } };
    const totalAttendanceDocs = await Attendance.countDocuments(attQuery);
    const presentAttendanceDocs = await Attendance.countDocuments({ ...attQuery, status: 'present' });
    
    const attendanceRate = totalAttendanceDocs > 0 
      ? Math.round((presentAttendanceDocs / totalAttendanceDocs) * 100) 
      : 0;

    // Attendance Daily Trend (for bar chart)
    const attendanceTrendAgg = await Attendance.aggregate([
      { $match: { ...attQuery, status: 'present' } },
      { $group: { _id: '$date', presentCount: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
    const attendanceTrend = attendanceTrendAgg.map(a => ({
      date: new Date(a._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      attendance: a.presentCount
    }));

    // 4. Member Activity Panel (Recent Joins & Activity)
    const recentMembers = await Member.find().sort({ joinDate: -1 }).limit(5).select('name email joinDate avatar');
    const recentActivity = await Attendance.find({ status: 'present' })
      .sort({ markedAt: -1 })
      .limit(5)
      .populate('memberId', 'name avatar')
      .select('markedAt memberId');

    res.json({
      metrics: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        totalRevenue: totalRevenueTimeframe,
        attendanceRate
      },
      charts: {
        planDistribution,
        revenueTrend,
        attendanceTrend
      },
      panels: {
        recentMembers,
        recentActivity: recentActivity.filter(a => a.memberId)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error compiling analytics', error: error.message });
  }
};

module.exports = {
  getAnalytics
};
