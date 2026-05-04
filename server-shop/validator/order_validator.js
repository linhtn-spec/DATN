import { body, validationResult } from "express-validator";

export const add_order_validator = [
    body("firstNameReceiver")
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 1, max: 50 }).withMessage("First name has at least 1 character and maximum 50 characters"),
    body("lastNameReceiver")
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 1, max: 50 }).withMessage("Last name has at least 1 character and maximum 50 characters"),
    body("phoneReceiver")
        .notEmpty().withMessage("Phone is required")
        .isLength({ min: 10, max: 13 }).withMessage("Phone name has at least 3 characters and maximum 13 characters"),
    body("emailReceiver")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Not an email")
        .isLength({ min: 1, max: 50 }).withMessage("Email name has at least 1 character and maximum 50 characters"),
    body("addressReceiver")
        .notEmpty().withMessage("Address id is required")
        .isLength({ min: 1, max: 50 }).withMessage("Address id must be at least 1 character and maximum 50 characters"),
    body("countryReceiver")
        .notEmpty().withMessage("Country is required")
        .isLength({ min: 1, max: 50 }).withMessage("Country has at least 1 character and maximum 50 characters"),
    body("note")
        .optional()
        .isLength({ min: 1, max: 300 }).withMessage("Note has at least 1 character and maximum 300 characters"),
    body("paymentMethod")
        .notEmpty().withMessage("Payment method is required")
        .isIn(['vnpay', 'cod']).withMessage("Payment method must be in regulation"),
    body("shippingMethod")
        .notEmpty().withMessage("Shipping method is required")
        .isIn(['express', 'free', 'standard']).withMessage("Shipping method must be in regulation"),
    body("products")
        .notEmpty().withMessage("Products is required")
        .isArray({ min: 1 }).withMessage("Products must be an array"),
    body("products.*.productId")
        .notEmpty().withMessage("Product id is required"),
    body("products.*.subPrice")
        .notEmpty().withMessage("Thumbnail is required")
        .isInt({ min: 1 }).withMessage("Min sub price is 1"),
    body("products.*.quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 1 }).withMessage("Quantity has min value 1"),
    body("tax")
        .isFloat({ min: 0 }).withMessage("Tax has min value 1"),
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
export const edit_order_validator = [
    body("paymentStatus")
        .optional()
        .isIn(['unpaid', 'partial_payment', 'paid']).withMessage("Payment status must be in regulation"),
    body("shippingStatus")
        .optional()
        .isIn(['not_sent', 'sending', 'sent']).withMessage("Shipping status must be in regulation"),
    body("orderStatus")
        .optional()
        .notEmpty().withMessage("Order status is required")
        .isIn(['new', 'processing', 'hold', 'canceled', 'done']).withMessage("Order status must be in regulation"),
    body("shippingCost")
        .optional()
        .isFloat({ min: 0 }).withMessage("Shipping cost has value min 0"),
    body("tax")
        .optional()
        .isFloat({ min: 0 }).withMessage("Tax has min value 1"),
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
