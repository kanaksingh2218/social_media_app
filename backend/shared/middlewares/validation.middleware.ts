import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

/**
 * Middleware to check validation results
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return next(new AppError(400, errorMessages));
    }
    next();
};

/**
 * Validation rules for user registration
 */
export const validateSignup = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 50 }).withMessage('Full name too long'),
    validate
];

/**
 * Validation rules for login
 */
export const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

/**
 * Validation rules for creating a post
 */
export const validateCreatePost = [
    body('content')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Post content too long (max 2000 characters)'),
    validate
];

/**
 * Validation rules for comments
 */
export const validateComment = [
    body('text')
        .trim()
        .notEmpty().withMessage('Comment text is required')
        .isLength({ max: 1000 }).withMessage('Comment too long (max 1000 characters)'),
    validate
];

/**
 * Validation for MongoDB ObjectId params
 */
export const validateObjectId = (paramName: string) => [
    param(paramName)
        .matches(/^[0-9a-fA-F]{24}$/).withMessage(`Invalid ${paramName}`),
    validate
];

/**
 * Sanitize text input - removes HTML tags and trims whitespace
 */
export const sanitizeTextInput = (text: string): string => {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
};
