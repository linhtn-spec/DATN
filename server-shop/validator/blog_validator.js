import { body, validationResult } from "express-validator";

export const add_blog_validator = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3, max: 200 }).withMessage("Title must be at least 3 characters and max 200 characters"),
    body("content")
        .notEmpty().withMessage("Content is required")
        .isLength({ min: 5, max: 20000 }).withMessage("Content must be at least 5 characters and max 20000 characters"),
    body("order")
        .escape()
        .notEmpty().withMessage("Order is required"),
    body("isActive")
        .escape()
        .notEmpty().withMessage("isActive is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                title: 'Validation failed',
                errors: errors.array(),
            });
        }
        next();
    }
];

export const edit_blog_validator = [
    body("title")
        .optional()
        .isLength({ min: 3, max: 200 }).withMessage("Title must be at least 3 characters and max 200 characters"),
    body("content")
        .optional()
        .isLength({ min: 5, max: 20000 }).withMessage("Content must be at least 5 characters and max 20000 characters"),
    body("order")
        .optional()
        .escape()
        .notEmpty().withMessage("Order is required"),
    body("isActive")
        .optional()
        .escape()
        .notEmpty().withMessage("isActive is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                title: 'Validation failed',
                errors: errors.array(),
            });
        }
        next();
    }
];
