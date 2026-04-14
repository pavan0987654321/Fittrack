const mongoose = require('mongoose');

// Helper to calculate BMI
function calcBMI(weight, height) {
  if (!weight || !height || height <= 0) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    trainerAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    // ── Fitness fields ─────────────────────────────────────────────────────────
    height: { type: Number, default: null },   // cm
    weight: { type: Number, default: null },   // kg
    bmi:    { type: Number, default: null },   // auto-calculated
    fitnessGoal: {
      type: String,
      enum: ['weight loss', 'muscle gain', 'endurance', 'flexibility', 'general fitness', ''],
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-calculate BMI before insert
memberSchema.pre('save', function (next) {
  this.bmi = calcBMI(this.weight, this.height);
  next();
});

// Auto-calculate BMI before findOneAndUpdate / updateOne
memberSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  const body = update?.$set || update || {};
  const weight = body.weight !== undefined ? body.weight : undefined;
  const height = body.height !== undefined ? body.height : undefined;
  if (weight !== undefined || height !== undefined) {
    // We only have what's being set; fetch current doc values via query if needed
    // For simplicity, require both when either changes — or compute if both present
    if (weight !== undefined && height !== undefined) {
      const bmi = calcBMI(weight, height);
      if (update.$set) update.$set.bmi = bmi;
      else update.bmi = bmi;
    }
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
