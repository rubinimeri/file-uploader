
const { body } = require("express-validator");

const validateSignUp = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isAlpha().withMessage("Username must only contain letters")
        .isLength({ min: 2 }).withMessage("Username must have at least 2 characters")
        .escape(),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 5 }).withMessage("Password must have at least 5 characters")
        .trim()
        .escape(),
    body("confirmPassword")
        .custom((value, { req }) => {
            return value === req.body.password;
        }).withMessage("Passwords must match")
        .trim()
        .escape()
]

const validateLogin = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isAlpha().withMessage("Username must only contain letters")
        .isLength({ min: 2 }).withMessage("Username must have at least 2 characters")
        .escape(),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 5 }).withMessage("Password must have at least 5 characters")
        .trim()
        .escape(),
]

module.exports = {
    validateSignUp,
    validateLogin
}
