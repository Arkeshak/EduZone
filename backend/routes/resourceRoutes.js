/**
 * RESOURCE ROUTES
 * 
 * File Purpose: Defines educational resource sharing endpoints
 * Used for: Teachers sharing materials, students accessing resources, resource management
 * 
 * Key endpoints:
 * - GET /resource - List all public resources (paginated)
 * - POST /resource - Upload new resource (teachers only)
 * - GET /resource/:id - Download/view resource
 * - PUT /resource/:id - Update resource (uploader only)
 * - DELETE /resource/:id - Delete resource (uploader only)
 * 
 * Data managed: Files (PDFs, docs, videos), metadata, access levels
 */

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
const { validate, validationRules } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const upload = require('../middleware/uploadMiddleware');

router.get('/public', validationRules.pagination(), validate, asyncHandler(getPublicResources));
router.post('/', protect, upload.single('file'), validationRules.resourceUpload(), validate, asyncHandler(uploadResource));
router.get('/my-resources', protect, validationRules.pagination(), validate, asyncHandler(getMyResources));
router.put('/:id', protect, upload.single('file'), validationRules.resourceUpdate(), validate, asyncHandler(updateResource));
router.delete('/:id', protect, asyncHandler(deleteResource));

module.exports = router;
