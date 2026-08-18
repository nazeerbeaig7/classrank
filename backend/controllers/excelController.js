const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { parseExcelBuffer, exportLeaderboardExcel } = require('../utils/excelHandler');
const { sortStudents, calculateRanks } = require('../utils/rankingEngine');

// @desc    Preview or import students from uploaded Excel/CSV file
// @route   POST /api/students/import
// @access  Private/Admin
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file (.xlsx, .xls, .csv)' });
    }

    const commitImport = req.query.commit === 'true' || req.body.commit === 'true';
    const parsedData = await parseExcelBuffer(req.file.buffer);

    let insertedCount = 0;

    if (commitImport && parsedData.validRows.length > 0) {
      // Prepare hashed passwords and save records
      const hashedRows = await Promise.all(
        parsedData.validRows.map(async (row) => {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(row.password, salt);
          return {
            rollNumber: row.rollNumber,
            name: row.name,
            email: row.email,
            password: hashedPassword,
            backlogCount: row.backlogCount,
            cgpa: row.cgpa,
            percentage: row.percentage
          };
        })
      );

      const inserted = await Student.insertMany(hashedRows, { ordered: false });
      insertedCount = inserted.length;
    }

    res.json({
      success: true,
      committed: commitImport,
      summary: {
        totalRows: parsedData.totalRows,
        validCount: parsedData.validRows.length,
        invalidCount: parsedData.invalidRows.length,
        insertedCount: commitImport ? insertedCount : 0
      },
      validRows: parsedData.validRows,
      invalidRows: parsedData.invalidRows
    });
  } catch (error) {
    console.error('[ExcelCtrl] Import error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error processing Excel file' });
  }
};

// @desc    Export sorted leaderboard as formatted Excel (.xlsx) file
// @route   GET /api/students/export
// @access  Public / Admin
const exportStudents = async (req, res) => {
  try {
    const allStudents = await Student.find({});
    const sorted = sortStudents(allStudents);
    const ranked = calculateRanks(sorted);

    const buffer = exportLeaderboardExcel(ranked);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ClassRank_Leaderboard.xlsx"');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('[ExcelCtrl] Export error:', error);
    res.status(500).json({ success: false, message: 'Error generating Excel export file' });
  }
};

module.exports = {
  importStudents,
  exportStudents
};
