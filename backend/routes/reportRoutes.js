const express = require('express');
const router = express.Router();
const { submitReport, getReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitReport);
router.get('/', protect, getReports);

module.exports = router;
