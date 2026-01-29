// Input Validation Middleware
const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
            timestamp: new Date().toISOString()
        });
    }
    next();
};

// Auth validation rules
const validateRegister = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('role').isIn(['FOUNDER', 'PROFESSIONAL']).withMessage('Role must be FOUNDER or PROFESSIONAL'),
    handleValidationErrors
];

const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    handleValidationErrors
];

// Project validation
const validateProject = [
    body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
    body('equity_offered').optional().isFloat({ min: 0, max: 100 }).withMessage('Equity must be 0-100%'),
    body('salary_offered').optional().isFloat({ min: 0 }).withMessage('Salary must be positive'),
    body('required_skills').optional().isArray().withMessage('Skills must be an array'),
    body('deadline').optional().isISO8601().withMessage('Invalid date format'),
    handleValidationErrors
];

// Message validation
const validateMessage = [
    body('receiver_id').notEmpty().withMessage('Receiver ID required'),
    body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be 1-5000 characters'),
    handleValidationErrors
];

// Equity offer validation
const validateEquityOffer = [
    body('equity_percentage').isFloat({ min: 0.01, max: 100 }).withMessage('Equity must be 0.01-100%'),
    body('vesting_period').optional().isInt({ min: 1, max: 120 }).withMessage('Vesting period must be 1-120 months'),
    body('cliff_period').optional().isInt({ min: 0, max: 48 }).withMessage('Cliff period must be 0-48 months'),
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id').notEmpty().withMessage('ID parameter required'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateProject,
    validateMessage,
    validateEquityOffer,
    validateId,
    handleValidationErrors
};
