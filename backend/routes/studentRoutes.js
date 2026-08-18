const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

router.get('/', getStudents);
router.get('/:id', getStudentById);

// Protected routes
router.post('/', protect, protectAdmin, createStudent);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, protectAdmin, deleteStudent);

module.exports = router;
