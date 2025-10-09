const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitize string inputs to prevent injection
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  // Remove potentially dangerous characters
  return value.replace(/[<>\"'%;()&+]/g, '');
};

// Net Operation validations
const validateNetOperation = [
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(sanitizeString),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .customSanitizer(sanitizeString),
  body('frequency')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .customSanitizer(sanitizeString),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .customSanitizer(sanitizeString),
  handleValidationErrors
];

const validateCheckIn = [
  body('callsign')
    .isString()
    .isLength({ min: 3, max: 10 })
    .customSanitizer(val => val.toUpperCase()),
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(sanitizeString),
  body('location')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(sanitizeString),
  body('license_class')
    .optional()
    .isString()
    .isLength({ max: 10 })
    .customSanitizer(sanitizeString),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .customSanitizer(sanitizeString),
  body('stayingForComments')
    .optional()
    .isBoolean(),
  handleValidationErrors
];

const validateUpdateUser = [
  body('username')
    .optional()
    .isString()
    .isLength({ min: 3, max: 30 })
    .customSanitizer(sanitizeString),
  body('callsign')
    .optional()
    .isString()
    .isLength({ min: 3, max: 10 })
    .customSanitizer(val => val.toUpperCase()),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail(),
  handleValidationErrors
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

const validateReportQuery = [
  query('operatorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid operator ID format'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('status')
    .optional()
    .isIn(['active', 'scheduled', 'completed'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

module.exports = {
  validateNetOperation,
  validateCheckIn,
  validateUpdateUser,
  validateMongoId,
  validateReportQuery,
  sanitizeString,
  handleValidationErrors
};
