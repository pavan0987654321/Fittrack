const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    duration: {
      type: Number, // in months
      required: [true, 'Duration is required'],
      min: 1,
    },
    description: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    color: {
      type: String,
      default: '#6366f1', // indigo
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
