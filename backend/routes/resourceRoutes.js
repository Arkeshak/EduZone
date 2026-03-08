const express = require('express');
const router = express.Router();
const {
    uploadResource,
    getPublicResources,
    getMyResources,
    updateResource,
    deleteResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Route
router.get('/public', getPublicResources);

// Protected Routes
router.post('/', protect, upload.single('file'), uploadResource);
router.get('/my-resources', protect, getMyResources);
router.put('/:id', protect, upload.single('file'), updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
