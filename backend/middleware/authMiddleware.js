const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'classrank_super_secret_jwt_key_2026_academic_perf');

      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
        req.role = 'admin';
      } else {
        req.user = await Student.findById(decoded.id).select('-password');
        req.role = 'student';
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      next();
    } catch (error) {
      console.error('[AuthMiddleware] Token failure:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no access token provided' });
  }
};

const protectAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin authorization required.' });
  }
  next();
};

module.exports = { protect, protectAdmin };
