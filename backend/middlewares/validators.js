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

// Post creation validation
export const createPostValidationRules = () => [
    body('content')
        .trim()
        .notEmpty().withMessage('Post content is required')
        .isLength({ max: 500 }).withMessage('Post content cannot exceed 500 characters'),
    body('hadithRef')
        .optional()
        .isString().withMessage('Hadith reference must be a string'),
    body('images')
        .optional()
        .isArray({ max: 4 }).withMessage('Maximum 4 images allowed'),
    body('replyTo')
        .optional()
        .isMongoId().withMessage('Invalid post ID for reply'),
    body('sharedContent')
        .optional()
        .isObject().withMessage('sharedContent must be an object'),
    body('sharedContent.kind')
        .optional()
        .isIn(['hadith', 'ayah', 'ruku', 'juzz', 'mood', 'sign'])
        .withMessage('Invalid sharedContent kind'),
    body('sharedContent.title')
        .optional()
        .isString().withMessage('sharedContent title must be a string')
        .isLength({ max: 200 }).withMessage('sharedContent title is too long'),
    body('sharedContent.excerpt')
        .optional()
        .isString().withMessage('sharedContent excerpt must be a string')
        .isLength({ max: 800 }).withMessage('sharedContent excerpt is too long'),
    body('sharedContent.arabic')
        .optional()
        .isString().withMessage('sharedContent arabic must be a string')
        .isLength({ max: 2000 }).withMessage('sharedContent arabic is too long'),
    body('sharedContent.translation')
        .optional()
        .isString().withMessage('sharedContent translation must be a string')
        .isLength({ max: 1200 }).withMessage('sharedContent translation is too long'),
    body('sharedContent.sourceRef')
        .optional()
        .isString().withMessage('sharedContent sourceRef must be a string')
        .isLength({ max: 200 }).withMessage('sharedContent sourceRef is too long'),
    body('sharedContent.sourceRoute')
        .optional()
        .isString().withMessage('sharedContent sourceRoute must be a string')
        .isLength({ max: 500 }).withMessage('sharedContent sourceRoute is too long'),
    body('sharedContent.meta')
        .optional()
        .isArray({ max: 8 }).withMessage('sharedContent meta can have up to 8 items'),
    handleValidationErrors
];

// Share-to-feed validation (dedicated share endpoint)
export const shareToFeedValidationRules = () => [
    body('content')
        .optional()
        .isString().withMessage('Feed caption must be a string')
        .isLength({ max: 500 }).withMessage('Caption cannot exceed 500 characters'),
    body('sharedContent')
        .notEmpty().withMessage('sharedContent is required for share-to-feed')
        .isObject().withMessage('sharedContent must be an object'),
    body('sharedContent.kind')
        .notEmpty().withMessage('sharedContent.kind is required')
        .isIn(['hadith', 'ayah', 'ruku', 'juzz', 'mood', 'sign'])
        .withMessage('Invalid sharedContent kind'),
    body('sharedContent.title')
        .optional()
        .isString().withMessage('sharedContent title must be a string')
        .isLength({ max: 200 }).withMessage('sharedContent title is too long'),
    body('sharedContent.excerpt')
        .optional()
        .isString().withMessage('sharedContent excerpt must be a string')
        .isLength({ max: 800 }).withMessage('sharedContent excerpt is too long'),
    body('sharedContent.arabic')
        .optional()
        .isString().withMessage('sharedContent arabic must be a string')
        .isLength({ max: 2000 }).withMessage('sharedContent arabic is too long'),
    body('sharedContent.translation')
        .optional()
        .isString().withMessage('sharedContent translation must be a string')
        .isLength({ max: 1200 }).withMessage('sharedContent translation is too long'),
    body('sharedContent.sourceRef')
        .optional()
        .isString().withMessage('sharedContent sourceRef must be a string')
        .isLength({ max: 200 }).withMessage('sharedContent sourceRef is too long'),
    body('sharedContent.sourceRoute')
        .optional()
        .isString().withMessage('sharedContent sourceRoute must be a string')
        .isLength({ max: 500 }).withMessage('sharedContent sourceRoute is too long'),
    body('sharedContent.meta')
        .optional()
        .isArray({ max: 8 }).withMessage('sharedContent meta can have up to 8 items'),
    handleValidationErrors
];

export { handleValidationErrors }; // Export if needed directly elsewhere, though typically used within rule arrays

// ── Stream creation validation ────────────────────────
export const createStreamValidationRules = () => [
    body('title')
        .trim()
        .notEmpty().withMessage('Stream title is required')
        .isLength({ max: 200 }).withMessage('Stream title cannot exceed 200 characters'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('scheduledFor')
        .optional()
        .isISO8601().withMessage('scheduledFor must be a valid ISO 8601 date'),
    handleValidationErrors
];

// ── Chat conversation validation ─────────────────────
export const startConversationValidationRules = () => [
    body('userId')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid user ID format'),
    handleValidationErrors
];

// ── Chat message validation ───────────────────────────
export const sendMessageValidationRules = () => [
    param('id')
        .isMongoId().withMessage('Invalid conversation ID format'),
    body('content')
        .trim()
        .notEmpty().withMessage('Message content is required')
        .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
    handleValidationErrors
];

// ── Reset password validation ─────────────────────────
export const resetPasswordValidationRules = () => [
    param('token')
        .notEmpty().withMessage('Reset token is required')
        .isString().withMessage('Invalid reset token'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];

// ── Spiritual practice validation ─────────────────────
// Field names and limits must match the client payload (SpiritualPracticePayload
// in frontend/src/features/ruhani/api/ruhaniApi.ts) and spiritualPracticeSchema.js.
export const savePracticeValidationRules = () => [
    body('practiceType')
        .notEmpty().withMessage('Practice type is required')
        .bail()
        .isIn(['tafakkur', 'tadabbur', 'tazkia']).withMessage('Invalid practice type'),

    body('sourceRef')
        .trim()
        .notEmpty().withMessage('sourceRef is required')
        .isLength({ max: 200 }).withMessage('sourceRef cannot exceed 200 characters'),

    body('sourceTitle')
        .trim()
        .notEmpty().withMessage('sourceTitle is required')
        .isLength({ max: 500 }).withMessage('sourceTitle cannot exceed 500 characters'),

    body('reflectionText')
        .optional()
        .isString().withMessage('reflectionText must be a string')
        .isLength({ max: 10000 }).withMessage('Reflection cannot exceed 10,000 characters'),

    body('guidedAnswers')
        .optional()
        .isArray({ max: 20 }).withMessage('guidedAnswers must contain 20 entries or fewer'),
    body('guidedAnswers.*.prompt')
        .optional()
        .isString().withMessage('Guided answer prompt must be a string')
        .isLength({ max: 500 }).withMessage('Guided answer prompt cannot exceed 500 characters'),
    body('guidedAnswers.*.answer')
        .optional()
        .isString().withMessage('Guided answer must be a string')
        .isLength({ max: 5000 }).withMessage('Guided answer cannot exceed 5,000 characters'),

    body('habitChecks')
        .optional()
        .isArray({ max: 50 }).withMessage('habitChecks must contain 50 entries or fewer'),
    body('habitChecks.*.habit')
        .optional()
        .isString().withMessage('Habit must be a string')
        .isLength({ max: 200 }).withMessage('Habit cannot exceed 200 characters'),
    body('habitChecks.*.completed')
        .optional()
        .isBoolean().withMessage('Habit completed must be a boolean'),

    body('traitRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('traitRating must be between 1 and 5'),

    body('isPrivate')
        .optional()
        .isBoolean().withMessage('isPrivate must be a boolean'),

    body('linkedPracticeId')
        .optional()
        .isMongoId().withMessage('linkedPracticeId must be a valid id'),

    handleValidationErrors
];

// Editing an existing practice. practiceType/sourceRef/sourceTitle are immutable —
// they identify what was contemplated, so only the user's own writing is editable.
export const updatePracticeValidationRules = () => [
    body('reflectionText')
        .optional()
        .isString().withMessage('reflectionText must be a string')
        .isLength({ max: 10000 }).withMessage('Reflection cannot exceed 10,000 characters'),

    body('guidedAnswers')
        .optional()
        .isArray({ max: 20 }).withMessage('guidedAnswers must contain 20 entries or fewer'),
    body('guidedAnswers.*.prompt')
        .optional()
        .isString().isLength({ max: 500 }).withMessage('Guided answer prompt cannot exceed 500 characters'),
    body('guidedAnswers.*.answer')
        .optional()
        .isString().isLength({ max: 5000 }).withMessage('Guided answer cannot exceed 5,000 characters'),

    body('habitChecks')
        .optional()
        .isArray({ max: 50 }).withMessage('habitChecks must contain 50 entries or fewer'),

    body('traitRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('traitRating must be between 1 and 5'),

    body('isPrivate')
        .optional()
        .isBoolean().withMessage('isPrivate must be a boolean'),

    handleValidationErrors
];

// ── Profile update validation ─────────────────────────
export const updateProfileValidationRules = () => [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
    body('bio')
        .optional()
        .isString().withMessage('Bio must be a string')
        .isLength({ max: 160 }).withMessage('Bio cannot exceed 160 characters'),
    body('avatar')
        .optional()
        .isString().withMessage('Avatar must be a string URL'),
    handleValidationErrors
];

// ── Change password validation ────────────────────────
export const changePasswordValidationRules = () => [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    handleValidationErrors
];

// ── Scholar application validation ────────────────────
const SCHOLAR_SPECIALTIES = ['tafseer', 'hadith', 'fiqh', 'arabic', 'tajweed', 'aqeedah', 'seerah', 'dawah'];

export const scholarApplicationValidationRules = () => [
    body('credentials')
        .isArray({ min: 1 }).withMessage('At least one credential is required'),
    body('credentials.*.title')
        .notEmpty().withMessage('Credential title is required')
        .isString().isLength({ max: 200 }),
    body('credentials.*.institution')
        .notEmpty().withMessage('Credential institution is required')
        .isString().isLength({ max: 200 }),
    body('credentials.*.year')
        .isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid credential year'),
    body('credentials.*.documentUrl')
        .optional()
        .isURL().withMessage('Document URL must be a valid URL'),
    body('specialties')
        .isArray({ min: 1 }).withMessage('At least one specialty is required'),
    body('specialties.*')
        .isIn(SCHOLAR_SPECIALTIES).withMessage(`Specialty must be one of: ${SCHOLAR_SPECIALTIES.join(', ')}`),
    body('bio')
        .notEmpty().withMessage('Bio is required')
        .isString()
        .isLength({ min: 50, max: 2000 }).withMessage('Bio must be between 50 and 2000 characters'),
    body('teachingLanguages')
        .isArray({ min: 1 }).withMessage('At least one teaching language is required'),
    body('teachingLanguages.*')
        .isString().notEmpty(),
    body('videoIntroUrl')
        .optional()
        .isURL().withMessage('Video intro URL must be a valid URL'),
    handleValidationErrors
];

// ── Scholar review validation (admin) ─────────────────
export const scholarReviewValidationRules = () => [
    body('decision')
        .isIn(['approved', 'rejected']).withMessage("Decision must be 'approved' or 'rejected'"),
    body('rejectionReason')
        .optional()
        .isString().isLength({ min: 1 }),
    body('specialties')
        .optional()
        .isArray(),
    body('specialties.*')
        .optional()
        .isIn(SCHOLAR_SPECIALTIES).withMessage(`Specialty must be one of: ${SCHOLAR_SPECIALTIES.join(', ')}`),
    handleValidationErrors
];
