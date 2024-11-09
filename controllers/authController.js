const { PrismaClient } = require('@prisma/client');
const { validateLogin, validateSignUp } = require('../middleware/validateFields');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('../strategies/localStrategy');
const asyncHandler = require("express-async-handler");
const CustomError = require('../utils/customError')
const prisma = new PrismaClient();

function signUpGet(req, res, next) {
    const { user } = req;
    if (!user) {
        return res.render('auth/signUp')
    }
    const error = new CustomError('FORBIDDEN', 403);
    next(error);
}

const signUpPost = [
    validateSignUp,
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/signUp', { errors: errors });
        }

        const { username, password } = req.body;
        const checkUser = await prisma.user.findFirst({ where: { username } });
        if (!checkUser) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const { id } = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                }
            })
            await prisma.folder.create({
                data: {
                    name: 'My Files',
                    userId: id
                }
            })
            return next();
        }
        res.status(409).render("auth/signUp", {user: null, errors: ['Username already in use']});
    }),
    passport.authenticate('local', { successRedirect: '/' })
];

function loginGet(req, res, next) {
    const { user } = req;
    if (!user) {
        return res.render('auth/login')
    }
    const error = new CustomError('FORBIDDEN', 403);
    next(error);
}

const loginPost = [
    validateLogin,
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.render('auth/login', { errors: errors });
        }
        next()
    },
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
]

async function logoutPost(req, res, next) {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
}

module.exports = {
    signUpGet,
    signUpPost,
    loginGet,
    loginPost,
    logoutPost
}

