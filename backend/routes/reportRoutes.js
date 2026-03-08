const express = require('express');
const router = express.Router();
const { submitReport, getReports, getMySchoolReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitReport);
router.get('/', protect, getReports);
router.get('/my-school', protect, getMySchoolReports);

module.exports = router;
