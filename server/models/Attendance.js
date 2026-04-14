const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    date: {
      type: String, // stored as YYYY-MM-DD for easy dedup queries
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'present',
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique constraint: one record per member per day
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
