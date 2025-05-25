import { body, validationResult, param } from 'express-validator';
import { AppError } from '../utils/AppError.js'; // Updated path

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({ message: err.msg, field: err.path }));
        // Using 422 for validation errors is common
        return next(new AppError(`Validation failed: ${formattedErrors.map(e => e.message).join(', ')}`, 422, formattedErrors));
    }
    next();
};

export const registerValidationRules = () => [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];

export const loginValidationRules = () => [
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// Validation rules for follow/unfollow operations
export const followUnfollowValidationRules = () => [
  body('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  handleValidationErrors
];

// Validator for routes that expect a MongoDB ObjectId in the URL parameters
export const mongoIdParamValidationRules = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName} format in URL parameter`),
    handleValidationErrors
];

// Example for saved (bookmark) if contentId is in body.
// If contentId is a URL param, use mongoIdParamValidationRules('id') in the route.
export const savedValidationRules = () => [
    // If contentId were in the body:
    // body('contentId').notEmpty().isMongoId().withMessage('Valid content ID is required in the body'),
    // For now, assuming contentId is a URL parameter, handled by mongoIdParamValidationRules
    handleValidationErrors
];

// General purpose validator for checking if a body field is a valid MongoId
export const mongoIdBodyValidationRules = (fieldName = 'id') => [
    body(fieldName).notEmpty().isMongoId().withMessage(`Valid MongoDB ID for '${fieldName}' is required in the body`),
    handleValidationErrors
];

export { handleValidationErrors }; // Export if needed directly elsewhere, though typically used within rule arrays
