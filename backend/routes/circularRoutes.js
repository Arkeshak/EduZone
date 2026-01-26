const express = require('express');
const router = express.Router();
const { publishCircular, getCirculars } = require('../controllers/circularController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, publishCircular);
router.get('/', protect, getCirculars);

module.exports = router;
