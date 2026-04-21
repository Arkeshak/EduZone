const express = require('express');
const router = express.Router();
const { 
    getWelfareTypes, 
    createWelfareType, 
    updateWelfareType, 
    deleteWelfareType 
} = require('../controllers/welfareTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route for form selection
router.get('/', getWelfareTypes);

// Admin/Teacher routes for management
router.post('/', protect, authorize('ZEO', 'TEACHER'), createWelfareType);
router.put('/:id', protect, authorize('ZEO'), updateWelfareType);
router.delete('/:id', protect, authorize('ZEO'), deleteWelfareType);

module.exports = router;
