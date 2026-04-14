const Notification = require('../models/Notification');
const Member = require('../models/Member');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check for expiring memberships and create notifications
// @route   POST /api/notifications/check-expiries
// @access  Private/Admin (also runs internally)
const checkExpiries = async (req, res) => {
  try {
    // Expiry date window: today to next 5 days
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 5);

    const expiringMembers = await Member.find({
      status: 'active',
      expiryDate: { $gte: now, $lte: future }
    });

    let count = 0;

    for (const member of expiringMembers) {
      // Find the user for this member
      const user = await User.findOne({ email: member.email });
      if (!user) continue;

      // Calculate days exactly
      const daysLeft = Math.ceil((new Date(member.expiryDate) - now) / (1000 * 60 * 60 * 24));
      const expDateStr = new Date(member.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      const message = `Your membership is expiring in ${daysLeft} days (on ${expDateStr}). Please renew to stay active!`;

      // Check if we already notified them recently (in the last 3 days)
      const recentCheck = new Date();
      recentCheck.setDate(recentCheck.getDate() - 3);

      const existing = await Notification.findOne({
        userId: user._id,
        message, // Exactly matches this daysLeft
        createdAt: { $gte: recentCheck }
      });

      if (!existing) {
        // Also ensure we don't just spam them every day if there's *any* warning in last 3 days for same expiry context
        const anyRecentWarning = await Notification.findOne({
          userId: user._id,
          type: 'warning',
          createdAt: { $gte: recentCheck }
        });

        if (!anyRecentWarning) {
          await Notification.create({
            userId: user._id,
            message,
            type: 'warning'
          });
          count++;
        }
      }
    }

    if (res) {
      res.json({ message: `Expiry check complete. Sent ${count} notifications.`, count });
    }
    return count;
  } catch (error) {
    if (res) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.error('Expiry Check Error:', error);
    }
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  checkExpiries
};
