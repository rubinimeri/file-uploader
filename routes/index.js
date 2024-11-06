const { Router } = require('express');
const authController = require('../controllers/authController')
const indexController = require('../controllers/indexController')

const router = new Router();

router.get('/', indexController.homepageGet);

router.get('/sign-up', authController.signUpGet);
router.post('/sign-up', authController.signUpPost);
router.get('/login', authController.loginGet);
router.post('/login', authController.loginPost);
router.post('/logout', authController.logoutPost);

module.exports = router;