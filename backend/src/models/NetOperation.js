const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  callsign: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  license_class: {
    type: String,
    trim: true,
    default: ''
  },
  stayingForComments: {
    type: Boolean,
    default: false
  },
  commented: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const netOperationSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  operatorCallsign: {
    type: String,
    required: true,
    uppercase: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  checkIns: [checkInSchema],
  netName: {
    type: String,
    default: 'York County Amateur Radio Society Net'
  },
  frequency: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed'],
    default: 'active'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'bi-weekly', 'monthly'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Index for efficient querying by date
netOperationSchema.index({ startTime: -1 });

module.exports = mongoose.model('NetOperation', netOperationSchema);

