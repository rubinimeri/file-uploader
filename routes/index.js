const { Router } = require('express');
const fileRouter = require('./fileRouter');
const authRouter = require('./authRouter');
const folderRouter = require('./folderRouter');
const indexController = require('../controllers/indexController');
const globalErrorHandler = require('../controllers/errorController');
const CustomError = require('../utils/customError');

const router = new Router();

router.get('/', indexController.homepageGet);
router.use('/', authRouter);
router.use('/file', fileRouter);
router.use('/my-files', folderRouter);

router.all('*', (req, res, next) => {
    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404)
    next(err)
})
router.use(globalErrorHandler)

module.exports = router;