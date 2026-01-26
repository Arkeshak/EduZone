const express = require('express');
const router = express.Router();
const { getSchools, getSchoolUsers } = require('../controllers/schoolController');

router.get('/', getSchools);
router.get('/users', getSchoolUsers);

module.exports = router;
