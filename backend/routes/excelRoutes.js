const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importStudents, exportStudents } = require('../controllers/excelController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/import', protect, protectAdmin, upload.single('file'), importStudents);
router.get('/export', exportStudents);

module.exports = router;
