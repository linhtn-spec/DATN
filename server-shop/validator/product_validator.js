import { body, validationResult } from "express-validator";

export const add_product_validator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 1, max: 200 }).withMessage("Name has at least 1 character and maximum 200 characters"),
    body("price")
        .notEmpty().withMessage("Price is required")
        .isFloat({ min: 1 }).withMessage("Price  has value min 1"),
    body("images")
        .notEmpty().withMessage("Images is required")
        .isArray({ min: 1 }).withMessage("Images must be an array"),
    body("categoryId")
        .notEmpty().withMessage("Category is required"),
    body("isActive")
        .escape()
        .notEmpty().withMessage("isActive is required"),
    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 1, max: 5000 }).withMessage("Description has at least 1 character and maximum 5000 characters"),
    body("origin")
        .notEmpty().withMessage("Origin is required")
        .isLength({ min: 1, max: 300 }).withMessage("Origin has at least 1 character and maximum 300 characters"),
    body("unit")
        .notEmpty().withMessage("Unit is required")
        .isLength({ min: 1, max: 20 }).withMessage("Unit has at least 1 character and maximum 20 characters"),
    body("quantity")
        .optional()
        .custom((value) => {
            if (typeof value === 'number') {
                if (value < 0) throw new Error("Quantity must be a positive number");
                return true;
            }
            if (typeof value === 'object' && value !== null) {
                if (typeof value.inTrade !== 'number' || value.inTrade < 0) throw new Error("inTrade must be a positive number");
                return true;
            }
            throw new Error("Invalid quantity format");
        }),
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


export const edit_product_validator = [
    body("name")
        .optional()
        .isLength({ min: 1, max: 200 }).withMessage("Name has at least 1 character and maximum 200 characters"),
    body("price")
        .optional()
        .isFloat({ min: 1 }).withMessage("Price  has value min 1"),
    body("images")
        .optional()
        .isArray({ min: 1 }).withMessage("Images must be an array"),
    body("categoryId")
        .optional(),
    body("isActive")
        .escape()
        .optional(),
    body("description")
        .optional()
        .isLength({ min: 1, max: 5000 }).withMessage("Description has at least 1 character and maximum 5000 characters"),
    body("origin")
        .optional()
        .isLength({ min: 1, max: 300 }).withMessage("Origin has at least 1 character and maximum 300 characters"),
    body("unit")
        .optional()
        .isLength({ min: 1, max: 20 }).withMessage("Unit has at least 1 character and maximum 20 characters"),
    body("quantity")
        .optional()
        .custom((value) => {
            if (typeof value === 'number') {
                if (value < 0) throw new Error("Quantity must be a positive number");
                return true;
            }
            if (typeof value === 'object' && value !== null) {
                if (value.inTrade !== undefined && (typeof value.inTrade !== 'number' || value.inTrade < 0)) throw new Error("inTrade must be a positive number");
                return true;
            }
            throw new Error("Invalid quantity format");
        }),
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