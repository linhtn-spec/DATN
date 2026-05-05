import { body, validationResult } from "express-validator";





export const create_validator = [
    body("stars")
        .notEmpty().withMessage("Stars is required")
        .isFloat({ min: 0, max: 5 }).withMessage("Stars must be at least 0 and max 5"),
    body("productId")
        .notEmpty().withMessage("ProductId is required"),
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

    body("isActive")
        .optional({ values: "falsy" })
        .notEmpty().withMessage("isActive is required"),
    body("reply")
        .optional({ values: "falsy" })
        .isString().withMessage("Reply must be a string"),
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


