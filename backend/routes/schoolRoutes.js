const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSchools, getSchoolUsers, getMySchool, updateMySchool } = require('../controllers/schoolController');

router.get('/', getSchools);
router.get('/users', getSchoolUsers);
router.get('/my-school', protect, getMySchool);
router.put('/my-school', protect, updateMySchool);

module.exports = router;
