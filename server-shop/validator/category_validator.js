import { body, validationResult } from "express-validator";


export const create_validator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 1, max: 50 }).withMessage("Name must be at least 1 character and max 50 characters"),
    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 1, max: 300 }).withMessage("Description has at least 1 character and max 300 characters"),
    body("image")
        .notEmpty().withMessage("Image is required"),
    body("isActive")
        .escape()
        .notEmpty().withMessage("isActive is required"),
    body("order")
        .escape()
        .notEmpty().withMessage("Order is required"),
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
]

export const edit_validator = [
    body("name")
        .optional()
        .isLength({ min: 1, max: 50 }).withMessage("Name must be at least 1 character and max 50 characters"),
    body("description")
        .optional()
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 1, max: 300 }).withMessage("Description has at least 1 character and max 300 characters"),
    body("image")
        .optional()
        .notEmpty().withMessage("Image is required"),
    body("isActive")
        .optional({ values: "falsy" })
        .notEmpty().withMessage("isActive is required"),
    body("order")
        .optional()
        .notEmpty().withMessage("Order is required"),
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
]
