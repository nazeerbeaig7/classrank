const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { sortStudents, calculateRanks } = require('../utils/rankingEngine');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'classrank_super_secret_jwt_key_2026_academic_perf',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    let { rollNumber, name, email, password, backlogCount, cgpa, percentage } = req.body;

    if (!rollNumber || !name || !email || !password || backlogCount === undefined || cgpa === undefined || percentage === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    rollNumber = rollNumber.toString().trim().toUpperCase();
    email = email.toString().trim().toLowerCase();

    // Check duplicate roll number
    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ success: false, message: `Student with Roll Number '${rollNumber}' is already registered` });
    }

    // Check duplicate email
    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: `Email '${email}' is already registered` });
    }

    // Numeric validations
    const numBacklogs = Number(backlogCount);
    const numCgpa = Number(cgpa);
    const numPercentage = Number(percentage);

    if (isNaN(numBacklogs) || numBacklogs < 0 || !Number.isInteger(numBacklogs)) {
      return res.status(400).json({ success: false, message: 'Backlog count must be a non-negative integer' });
    }

    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be a number between 0 and 10' });
    }

    if (isNaN(numPercentage) || numPercentage < 0 || numPercentage > 100) {
      return res.status(400).json({ success: false, message: 'Percentage must be a number between 0 and 100' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      rollNumber,
      name: name.trim(),
      email,
      password: hashedPassword,
      backlogCount: numBacklogs,
      cgpa: Number(numCgpa.toFixed(2)),
      percentage: Number(numPercentage.toFixed(2))
    });

    const token = generateToken(student._id, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        backlogCount: student.backlogCount,
        cgpa: student.cgpa,
        percentage: student.percentage,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('[AuthCtrl] Register student error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Login student
// @route   POST /api/auth/student/login
// @access  Public
const loginStudent = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be rollNumber or email

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Roll Number/Email and Password' });
    }

    const cleanId = identifier.toString().trim();
    const student = await Student.findOne({
      $or: [
        { rollNumber: cleanId.toUpperCase() },
        { email: cleanId.toLowerCase() }
      ]
    }).select('+password');

    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number/Email or Password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number/Email or Password' });
    }

    const token = generateToken(student._id, 'student');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        backlogCount: student.backlogCount,
        cgpa: student.cgpa,
        percentage: student.percentage,
        canEditSelf: student.canEditSelf,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('[AuthCtrl] Student login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Email and Password' });
    }

    const cleanEmail = email.toString().trim().toLowerCase();
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('[AuthCtrl] Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (req.role === 'admin') {
      return res.json({
        success: true,
        user: {
          ...req.user.toObject(),
          role: 'admin'
        }
      });
    }

    // Student profile with live rank calculation
    const allStudents = await Student.find({});
    const sorted = sortStudents(allStudents);
    const ranked = calculateRanks(sorted);
    const myRankData = ranked.find(s => String(s._id) === String(req.user._id));

    res.json({
      success: true,
      user: {
        ...req.user.toObject(),
        role: 'student',
        overallRank: myRankData ? myRankData.overallRank : null,
        groupRank: myRankData ? myRankData.groupRank : null,
        totalStudents: allStudents.length
      }
    });
  } catch (error) {
    console.error('[AuthCtrl] Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  getMe
};
