const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/admin/login', loginAdmin);
router.get('/me', protect, getMe);

module.exports = router;
