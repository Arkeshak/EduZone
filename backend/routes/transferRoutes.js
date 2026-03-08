const express = require('express');
const router = express.Router();
const { initiateTransfer, getTransfers } = require('../controllers/transferController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('zeo'), upload.single('proof'), initiateTransfer);
router.get('/', protect, authorize('zeo', 'principal'), getTransfers);

module.exports = router;
