const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', protect, protectAdmin, updateSettings);

module.exports = router;
