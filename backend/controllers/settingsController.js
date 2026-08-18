const Settings = require('../models/Settings');

// @desc    Get global system settings
// @route   GET /api/settings
// @access  Public / Private
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await Settings.create({ key: 'global_config', allowStudentEdits: true });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error('[SettingsCtrl] Error getting settings:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving settings' });
  }
};

// @desc    Update system settings (Admin only)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global_config' });
    if (!settings) {
      settings = new Settings({ key: 'global_config' });
    }

    const { allowStudentEdits, academicYear, departmentName } = req.body;

    if (allowStudentEdits !== undefined) settings.allowStudentEdits = allowStudentEdits;
    if (academicYear) settings.academicYear = academicYear;
    if (departmentName) settings.departmentName = departmentName;

    await settings.save();

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('[SettingsCtrl] Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
