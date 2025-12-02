import { body, validationResult } from "express-validator";

export const register_validator = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 50 }).withMessage("Username must be at least 3 characters and max 50 characters"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Password has at least 6 characters and max 50 characters"),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Not email")
        .isLength({ min: 6, max: 50 }).withMessage("Email has at least 6 characters and max 50 characters"),
    body("confirm_password")
        .notEmpty().withMessage("Confirm password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Confirm password has at least 6 characters and max 50 characters")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                return Promise.reject(new Error('Confirm password is not match'));
            }
            return true;
        }),
    body("firstName")
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 3, max: 50 }).withMessage("First name has at least 5 characters and max 50 characters"),
    body("lastName")
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Last name has at least 5 characters and max 50 characters"),
    body("phone")
        .notEmpty().withMessage("Phone is required")
        .isLength({ min: 10, max: 13 }).withMessage("Phone has at least 10 characters and max 13 characters"),
    body("gender")
        .notEmpty().withMessage("Gender is required"),
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



export const forgot_password_validator = [
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Password has at least 6 characters and max 50 characters"),
    body("confirm_password")
        .notEmpty().withMessage("Confirm password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Confirm password has at least 6 characters and max 50 characters")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                return Promise.reject(new Error('Confirm password is not match'));
            }
            return true;
        }),
    body("token")
        .notEmpty().withMessage("Token is required"),
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




export const reset_password_validator = [
    body("current_password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Password has at least 6 characters and max 50 characters"),
    body("new_password")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Password has at least 6 characters and max 50 characters"),
    body("confirm_new_password")
        .notEmpty().withMessage("Confirm password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Confirm password has at least 6 characters and max 50 characters")
        .custom((value, { req }) => {
            if (value !== req.body.new_password) {
                return Promise.reject(new Error('Confirm password is not match'));
            }
            return true;
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


export const send_email_validator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Not email")
        .isLength({ min: 6, max: 50 }).withMessage("Email has at least 6 characters and max 50 characters"),
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



export const login_validator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Not email")
        .isLength({ min: 6, max: 50 }).withMessage("Email has at least 6 characters and max 50 characters"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Password has at least 6 characters and max 50 characters"),
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



export const create_validator = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 50 }).withMessage("Username must be at least 3 characters and max 50 characters"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6, max: 50 }).withMessage("Password has at least 6 characters and max 50 characters"),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Not email")
        .isLength({ min: 6, max: 50 }).withMessage("Email has at least 6 characters and max 50 characters"),

    body("firstName")
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 3, max: 50 }).withMessage("First name has at least 5 characters and max 50 characters"),
    body("lastName")
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Last name has at least 5 characters and max 50 characters"),
    body("phone")
        .notEmpty().withMessage("Phone is required")
        .isLength({ min: 10, max: 13 }).withMessage("Phone has at least 10 characters and max 13 characters"),
    body("gender")
        .notEmpty().withMessage("Gender is required"),
    body("image")
        .optional({ values: "falsy" })
        .notEmpty().withMessage("Gender is required"),
    body("isActive")
        .notEmpty().withMessage("isActive is required"),
    body("role")
        .notEmpty().withMessage("Role is required"),
    body("address")
        .notEmpty().withMessage("Address is required")
        .isLength({ min: 3, max: 150 }).withMessage("Address has at least 3 characters and max 150 characters"),
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
    body("username")
        .optional({ values: "falsy" })
        .isLength({ min: 3, max: 50 }).withMessage("Username must be at least 3 characters and max 50 characters"),
    body("email")
        .optional({ values: "falsy" })
        .isEmail().withMessage("Not email")
        .isLength({ min: 6, max: 50 }).withMessage("Email has at least 6 characters and max 50 characters"),
    body("firstName")
        .optional()
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 3, max: 50 }).withMessage("First name has at least 5 characters and max 50 characters"),
    body("lastName")
        .optional()
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Last name has at least 5 characters and max 50 characters"),
    body("phone")
        .optional()
        .notEmpty().withMessage("Phone is required")
        .isLength({ min: 10, max: 13 }).withMessage("Phone has at least 10 characters and max 13 characters"),
    body("gender")
        .optional()
        .notEmpty().withMessage("Gender is required"),
    body("image")
        .optional({ values: "falsy" }),
    body("isActive")
        .optional({ values: "falsy" }),
    body("role")
        .optional()
        .notEmpty().withMessage("isActive is required"),
    body("address")
        .optional()
        .notEmpty().withMessage("Address is required")
        .isLength({ min: 3, max: 150 }).withMessage("Address has at least 3 characters and max 150 characters"),
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