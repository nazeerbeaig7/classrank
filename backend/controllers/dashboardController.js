const Student = require('../models/Student');
const Settings = require('../models/Settings');
const { calculateStats, sortStudents, calculateRanks } = require('../utils/rankingEngine');

// @desc    Get complete dashboard stats & insights
// @route   GET /api/dashboard/stats
// @access  Public / Private
const getDashboardStats = async (req, res) => {
  try {
    const allStudents = await Student.find({});
    const stats = calculateStats(allStudents);

    // Get top 3 overall performers
    const sorted = sortStudents(allStudents);
    const ranked = calculateRanks(sorted);
    const topPerformers = ranked.slice(0, 3);

    // Get current global settings
    let settings = await Settings.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await Settings.create({ key: 'global_config', allowStudentEdits: true });
    }

    res.json({
      success: true,
      stats,
      topPerformers,
      settings: {
        allowStudentEdits: settings.allowStudentEdits,
        academicYear: settings.academicYear,
        departmentName: settings.departmentName
      }
    });
  } catch (error) {
    console.error('[DashboardCtrl] Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
