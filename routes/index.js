const { Router } = require('express');
const fileRouter = require('./fileRouter');
const authRouter = require('./authRouter');
const folderRouter = require('./folderRouter');
const indexController = require('../controllers/indexController');

const router = new Router();

router.get('/', indexController.homepageGet);
router.use('/', authRouter);
router.use('/file', fileRouter);
router.use('/', folderRouter);

module.exports = router;