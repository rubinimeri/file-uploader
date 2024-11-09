const { Router } = require('express');
const authController = require("../controllers/authController");

const authRouter = Router();

authRouter.get('/sign-up', authController.signUpGet);
authRouter.get('/login', authController.loginGet);
authRouter.post('/sign-up', authController.signUpPost);
authRouter.post('/login', authController.loginPost);
authRouter.post('/logout', authController.logoutPost);

module.exports = authRouter;