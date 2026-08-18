const XLSX = require('xlsx');
const Student = require('../models/Student');

/**
 * Normalizes header keys to standard names regardless of casing or formatting.
 */
const normalizeKey = (key) => {
  if (!key) return '';
  const clean = key.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('roll') || clean.includes('id')) return 'rollNumber';
  if (clean.includes('name') || clean.includes('student')) return 'name';
  if (clean.includes('backlog') || clean.includes('bl')) return 'backlogCount';
  if (clean.includes('cgpa') || clean.includes('gpa')) return 'cgpa';
  if (clean.includes('percent') || clean.includes('pct') || clean.includes('mark')) return 'percentage';
  return key;
};

/**
 * Parses and validates an Excel/CSV buffer.
 */
const parseExcelBuffer = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  const validRows = [];
  const invalidRows = [];
  
  // Existing roll numbers in database for duplicate detection
  const existingStudents = await Student.find({}, 'rollNumber email');
  const existingRolls = new Set(existingStudents.map(s => s.rollNumber.toUpperCase()));
  const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()));
  const processedRollsInFile = new Set();

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    const normalized = {};

    Object.keys(rawRow).forEach(key => {
      const normKey = normalizeKey(key);
      normalized[normKey] = rawRow[key];
    });

    const rowNumber = i + 2; // Accounting for 1-indexed header row
    const errors = [];

    // Extract fields
    const rollNumber = String(normalized.rollNumber || '').trim().toUpperCase();
    const name = String(normalized.name || '').trim();
    const rawBacklogs = normalized.backlogCount;
    const rawCgpa = normalized.cgpa;
    const rawPercentage = normalized.percentage;

    // Validate Roll Number
    if (!rollNumber) {
      errors.push('Roll Number is required');
    } else if (existingRolls.has(rollNumber)) {
      errors.push(`Roll Number '${rollNumber}' already exists in database`);
    } else if (processedRollsInFile.has(rollNumber)) {
      errors.push(`Duplicate Roll Number '${rollNumber}' in import file`);
    }

    // Validate Name
    if (!name) {
      errors.push('Student Name is required');
    }

    // Validate Backlogs
    const backlogCount = Number(rawBacklogs);
    if (rawBacklogs === '' || rawBacklogs === null || isNaN(backlogCount)) {
      errors.push('Backlog Count must be a valid number');
    } else if (backlogCount < 0 || !Number.isInteger(backlogCount)) {
      errors.push('Backlog Count must be a non-negative integer');
    }

    // Validate CGPA
    const cgpa = Number(rawCgpa);
    if (rawCgpa === '' || rawCgpa === null || isNaN(cgpa)) {
      errors.push('CGPA must be a valid number');
    } else if (cgpa < 0 || cgpa > 10) {
      errors.push('CGPA must be between 0 and 10');
    }

    // Validate Percentage
    const percentage = Number(rawPercentage);
    if (rawPercentage === '' || rawPercentage === null || isNaN(percentage)) {
      errors.push('Percentage must be a valid number');
    } else if (percentage < 0 || percentage > 100) {
      errors.push('Percentage must be between 0 and 100');
    }

    if (errors.length === 0) {
      processedRollsInFile.add(rollNumber);
      
      // Auto-generate email if missing
      const generatedEmail = `${rollNumber.toLowerCase()}@student.classrank.edu`;

      validRows.push({
        rowNumber,
        rollNumber,
        name,
        email: generatedEmail,
        password: `Student@${rollNumber}`, // Default student password
        backlogCount,
        cgpa: Number(cgpa.toFixed(2)),
        percentage: Number(percentage.toFixed(2))
      });
    } else {
      invalidRows.push({
        rowNumber,
        rollNumber: rollNumber || 'N/A',
        name: name || 'N/A',
        reasons: errors
      });
    }
  }

  return {
    validRows,
    invalidRows,
    totalRows: rawRows.length
  };
};

/**
 * Generates an Excel binary buffer for sorted leaderboard export.
 */
const exportLeaderboardExcel = (rankedStudents) => {
  const data = rankedStudents.map(student => ({
    'Rank': student.overallRank,
    'Roll Number': student.rollNumber,
    'Student Name': student.name,
    'Backlogs': student.backlogCount,
    'CGPA': student.cgpa.toFixed(2),
    'Percentage (%)': student.percentage.toFixed(2)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Rank
    { wch: 16 }, // Roll Number
    { wch: 25 }, // Name
    { wch: 12 }, // Backlogs
    { wch: 10 }, // CGPA
    { wch: 16 }  // Percentage
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ClassRank Leaderboard');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  parseExcelBuffer,
  exportLeaderboardExcel
};
