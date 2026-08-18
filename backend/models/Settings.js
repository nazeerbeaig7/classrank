const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global_config'
  },
  allowStudentEdits: {
    type: Boolean,
    default: true
  },
  academicYear: {
    type: String,
    default: '2025-2026'
  },
  departmentName: {
    type: String,
    default: 'Computer Science & Engineering'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
