const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  backlogCount: {
    type: Number,
    required: [true, 'Backlog count is required'],
    min: [0, 'Backlog count cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Backlog count must be an integer'
    }
  },
  cgpa: {
    type: Number,
    required: [true, 'CGPA is required'],
    min: [0, 'CGPA must be at least 0'],
    max: [10, 'CGPA cannot exceed 10']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage must be at least 0'],
    max: [100, 'Percentage cannot exceed 100']
  },
  canEditSelf: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for ranking queries
studentSchema.index({ backlogCount: 1, percentage: -1, cgpa: -1, rollNumber: 1 });

module.exports = mongoose.model('Student', studentSchema);
