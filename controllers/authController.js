const { PrismaClient } = require('@prisma/client');
const { validateLogin, validateSignUp } = require('../middleware/validateFields');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('../strategies/localStrategy');
const prisma = new PrismaClient();

function signUpGet(req, res) {
    const { user } = req;
    if (!user) {
        return res.render('auth/signUp')
    }
    res.send('Error: you are already logged in');
}

const signUpPost = [
    validateSignUp,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('auth/signUp', { errors: errors });
            }

            const { username, password } = req.body;
            const checkUser = await prisma.user.findFirst({ where: { username } });
            if (!checkUser) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.create({
                    data: {
                        username,
                        password: hashedPassword,
                    }
                })
                return next();
            }
            res.status(409).render("auth/signUp", {user: null, errors: ['Username already in use']});
        } catch (err) {
            console.error(err);
        }
    },
    passport.authenticate('local', { successRedirect: '/' })
];

function loginGet(req, res) {
    const { user } = req;
    if (!user) {
        return res.render('auth/login')
    }
    res.send('Error: you are already logged in');
}

const loginPost = [
    validateLogin,
    async (req, res, next) => {
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

