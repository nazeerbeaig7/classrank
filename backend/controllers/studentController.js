const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Settings = require('../models/Settings');
const { sortStudents, calculateRanks } = require('../utils/rankingEngine');

// @desc    Get all students (sorted with ranks)
// @route   GET /api/students
// @access  Public / Private
const getStudents = async (req, res) => {
  try {
    const { search, backlogFilter } = req.query;

    let allStudents = await Student.find({});
    
    // Sort according to ClassRank rules: backlogCount ASC -> percentage DESC -> cgpa DESC -> rollNumber ASC
    const sorted = sortStudents(allStudents);
    let ranked = calculateRanks(sorted);

    // Apply filters if requested
    if (backlogFilter !== undefined && backlogFilter !== '' && backlogFilter !== 'all') {
      if (backlogFilter === '4+') {
        ranked = ranked.filter(s => s.backlogCount >= 4);
      } else {
        const filterVal = Number(backlogFilter);
        ranked = ranked.filter(s => s.backlogCount === filterVal);
      }
    }

    if (search) {
      const q = search.toString().trim().toLowerCase();
      ranked = ranked.filter(s => 
        s.rollNumber.toLowerCase().includes(q) || 
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: ranked.length,
      students: ranked
    });
  } catch (error) {
    console.error('[StudentCtrl] Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving students' });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public / Private
const getStudentById = async (req, res) => {
  try {
    const allStudents = await Student.find({});
    const sorted = sortStudents(allStudents);
    const ranked = calculateRanks(sorted);

    const student = ranked.find(s => String(s._id) === String(req.params.id));

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('[StudentCtrl] Get student by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student details' });
  }
};

// @desc    Create student manually (Admin only)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    let { rollNumber, name, email, password, backlogCount, cgpa, percentage } = req.body;

    if (!rollNumber || !name || backlogCount === undefined || cgpa === undefined || percentage === undefined) {
      return res.status(400).json({ success: false, message: 'Roll Number, Name, Backlogs, CGPA, and Percentage are required' });
    }

    rollNumber = rollNumber.toString().trim().toUpperCase();
    email = email ? email.toString().trim().toLowerCase() : `${rollNumber.toLowerCase()}@student.classrank.edu`;

    // Check roll number duplicate
    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ success: false, message: `Roll Number '${rollNumber}' already exists` });
    }

    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: `Email '${email}' is already in use` });
    }

    const numBacklogs = Number(backlogCount);
    const numCgpa = Number(cgpa);
    const numPercentage = Number(percentage);

    if (isNaN(numBacklogs) || numBacklogs < 0 || !Number.isInteger(numBacklogs)) {
      return res.status(400).json({ success: false, message: 'Backlog count must be a non-negative integer' });
    }

    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be between 0 and 10' });
    }

    if (isNaN(numPercentage) || numPercentage < 0 || numPercentage > 100) {
      return res.status(400).json({ success: false, message: 'Percentage must be between 0 and 100' });
    }

    const rawPassword = password || `Student@${rollNumber}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const student = await Student.create({
      rollNumber,
      name: name.trim(),
      email,
      password: hashedPassword,
      backlogCount: numBacklogs,
      cgpa: Number(numCgpa.toFixed(2)),
      percentage: Number(numPercentage.toFixed(2))
    });

    res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      student
    });
  } catch (error) {
    console.error('[StudentCtrl] Create student error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating student' });
  }
};

// @desc    Update student data
// @route   PUT /api/students/:id
// @access  Private (Admin OR Student updating own profile if allowed)
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Authorization check
    if (req.role !== 'admin') {
      // Must be student modifying own profile
      if (String(req.user._id) !== String(student._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized. You cannot edit another student\'s information.' });
      }

      // Check if global settings allow student edits
      const settings = await Settings.findOne({ key: 'global_config' });
      const canEdit = settings ? settings.allowStudentEdits : true;
      if (!canEdit) {
        return res.status(403).json({ success: false, message: 'Editing academic data is currently locked by the Admin.' });
      }
    }

    const { name, email, backlogCount, cgpa, percentage, rollNumber } = req.body;

    if (rollNumber && req.role === 'admin') {
      const newRoll = rollNumber.toString().trim().toUpperCase();
      if (newRoll !== student.rollNumber) {
        const rollDup = await Student.findOne({ rollNumber: newRoll });
        if (rollDup) {
          return res.status(400).json({ success: false, message: `Roll Number '${newRoll}' is already assigned to another student.` });
        }
        student.rollNumber = newRoll;
      }
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.toString().trim().toLowerCase();

    if (backlogCount !== undefined) {
      const numBacklogs = Number(backlogCount);
      if (isNaN(numBacklogs) || numBacklogs < 0 || !Number.isInteger(numBacklogs)) {
        return res.status(400).json({ success: false, message: 'Backlog count must be a non-negative integer' });
      }
      student.backlogCount = numBacklogs;
    }

    if (cgpa !== undefined) {
      const numCgpa = Number(cgpa);
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        return res.status(400).json({ success: false, message: 'CGPA must be between 0 and 10' });
      }
      student.cgpa = Number(numCgpa.toFixed(2));
    }

    if (percentage !== undefined) {
      const numPercentage = Number(percentage);
      if (isNaN(numPercentage) || numPercentage < 0 || numPercentage > 100) {
        return res.status(400).json({ success: false, message: 'Percentage must be between 0 and 100' });
      }
      student.percentage = Number(numPercentage.toFixed(2));
    }

    await student.save();

    res.json({
      success: true,
      message: 'Student record updated successfully',
      student
    });
  } catch (error) {
    console.error('[StudentCtrl] Update student error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating student' });
  }
};

// @desc    Delete student record (Admin only)
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    await student.deleteOne();

    res.json({
      success: true,
      message: `Student '${student.name}' (${student.rollNumber}) deleted successfully`
    });
  } catch (error) {
    console.error('[StudentCtrl] Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting student' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
