/**
 * FILE UPLOAD MIDDLEWARE
 * 
 * File Purpose: Configures file upload handling with multer
 * Used for: Teachers uploading resources, donors uploading receipts, circulars with attachments
 * 
 * Configuration:
 * - Storage: Disk storage in 'uploads/' folder
 * - Filename: Timestamp + original name (prevents collisions)
 * - File types: JPEG, PNG, PDF only
 * - Size limit: 5MB per file
 * - Validation: MIME type and extension checking
 * 
 * Usage: router.post('/upload', upload.single('file'), controller.function)
 * Result: req.file contains {filename, path, originalname, size, mimetype}
 */

const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
