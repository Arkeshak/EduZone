const { body, query, param, validationResult } = require('express-validator');

/**
 * VALIDATION ERROR HANDLER MIDDLEWARE
 * 
 * Purpose: Centralized error handling for all validation failures
 * Called by all validation rules at the end of the rule chain
 * 
 * Flow: Validation rules run → Check for errors → If errors, respond with 400
 *       If no errors, call next() to continue to route handler
 * 
 * Response format includes:
 * - field: Name of the field that failed
 * - message: User-friendly error message
 * - value: The value user tried to submit (helps with debugging)
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    // ✅ If validation found errors, return them immediately
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,           // Which field failed validation
                message: err.msg,           // Error message to show user
                value: err.value            // What user submitted
            }))
        });
    }

    // ✅ No errors found, continue to route handler
    next();
};

/**
 * PAGINATION VALIDATION RULES
 * 
 * Purpose: Validate page and limit query parameters for list endpoints
 * Used in: GET /welfare, GET /donations, GET /resources, etc.
 * 
 * Rules:
 * - page: Optional, must be integer 1-100000
 * - limit: Optional, must be integer 10-500 (prevents too-large responses)
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 100000 })
        .withMessage('Page must be between 1 and 100000'),
    query('limit')
        .optional()
        .isInt({ min: 10, max: 500 })
        .withMessage('Limit must be between 10 and 500'),
    handleValidationErrors
];

// Welfare request validation
const validateWelfareRequest = [
    body('studentName')
        .trim()
        .notEmpty()
        .withMessage('Student name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Student name must be between 2 and 100 characters'),
    body('grade')
        .trim()
        .notEmpty()
        .withMessage('Grade is required')
        .isLength({ min: 1, max: 5 })
        .withMessage('Grade format invalid'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('amountRequired')
        .notEmpty()
        .withMessage('Amount required is needed')
        .isFloat({ min: 100, max: 10000000 })
        .withMessage('Amount must be between 100 and 10000000'),
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Supplies', 'Fees', 'Medical', 'Transport', 'Equipment', 'Hostel', 'Food', 'Books', 'Uniforms', 'Other'])
        .withMessage('Invalid welfare category'),
    body('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH'])
        .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
    body('section')
        .optional()
        .trim()
        .isLength({ max: 5 })
        .withMessage('Section format invalid'),
    handleValidationErrors
];

// Welfare status update validation
const validateWelfareStatusUpdate = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid welfare request ID'),
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['PRINCIPAL_APPROVED', 'ZEO_APPROVED', 'PUBLISHED', 'REJECTED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'])
        .withMessage('Invalid status'),
    body('remarks')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Remarks must not exceed 500 characters'),
    handleValidationErrors
];

// Donation validation
const validateDonation = [
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isFloat({ min: 1, max: 10000000 })
        .withMessage('Amount must be between 1 and 10000000'),
    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['ONLINE', 'BANK_TRANSFER', 'Online', 'Bank Transfer'])
        .withMessage('Invalid payment method'),
    body('welfareRequestId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid welfare request ID'),
    body('paymentReference')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Payment reference too long'),
    handleValidationErrors
];

// Donation verification validation
const validateDonationVerification = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid donation ID'),
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['VERIFIED', 'REJECTED'])
        .withMessage('Status must be VERIFIED or REJECTED'),
    body('remarks')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Remarks too long'),
    handleValidationErrors
];

// Staff creation validation
const validateStaffCreation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['TEACHER', 'PRINCIPAL'])
        .withMessage('Role must be TEACHER or PRINCIPAL'),
    body('schoolId')
        .notEmpty()
        .withMessage('School ID is required')
        .isInt({ min: 1 })
        .withMessage('School ID must be a valid number'),
    body('subjects')
        .optional()
        .trim()
        .custom(value => {
            // Only letters, commas, and spaces
            return /^[a-zA-Z,\s]+$/.test(value);
        })
        .withMessage('Subjects format invalid'),
    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Invalid password'),
    handleValidationErrors
];

// Donor registration validation
const validateDonorRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9\-\+\(\)]+$/)
        .withMessage('Invalid phone number'),
    body('organizationName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Organization name too long'),
    handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
    param('resetToken')
        .notEmpty()
        .withMessage('Reset token is required')
        .isLength({ min: 64, max: 64 })
        .withMessage('Invalid token format'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters'),
    handleValidationErrors
];

// Verify email validation
const validateVerifyEmail = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('code')
        .notEmpty()
        .withMessage('Verification code is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('Code must be 6 digits'),
    handleValidationErrors
];

// Resource ID validation
const validateResourceId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid resource ID'),
    handleValidationErrors
];

// Account activation validation
const validateAccountActivation = [
    body('token')
        .notEmpty()
        .withMessage('Activation token is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters'),
    handleValidationErrors
];

// Change password validation
const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Must be between 8 and 128 chars'),
    handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('organizationName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Organization name too long'),
    body('contactNumber')
        .optional()
        .trim()
        .matches(/^[0-9\-\+\(\)]+$/)
        .withMessage('Invalid phone number'),
    handleValidationErrors
];

module.exports = {
    validate: handleValidationErrors,
    validationRules: {
        pagination: () => validatePagination,
        welfareRequest: () => validateWelfareRequest,
        welfareStatusUpdate: () => validateWelfareStatusUpdate,
        welfareStatus: () => validateWelfareStatusUpdate,
        donation: () => validateDonation,
        donationVerification: () => validateDonationVerification,
        staffCreation: () => validateStaffCreation,
        userCreation: () => validateStaffCreation,
        login: () => validateLogin,
        donorRegistration: () => validateDonorRegistration,
        passwordReset: () => validatePasswordReset,
        emailVerification: () => validateVerifyEmail,
        accountActivation: () => validateAccountActivation,
        changePassword: () => validateChangePassword,
        tokenRefresh: () => [],
        forgotPassword: () => [],
        resourceId: () => validateResourceId,
        schoolUpdate: () => [],
        resourceUpload: () => [],
        resourceUpdate: () => [],
        profileUpdate: () => validateProfileUpdate
    },
    // Export individual rules for backward compatibility
    handleValidationErrors,
    validatePagination,
    validateWelfareRequest,
    validateWelfareStatusUpdate,
    validateDonation,
    validateDonationVerification,
    validateStaffCreation,
    validateLogin,
    validateDonorRegistration,
    validatePasswordReset,
    validateVerifyEmail,
    validateResourceId,
    validateAccountActivation,
    validateChangePassword
};
