const { Router } = require('express');
const authController = require('../controllers/authController');
const indexController = require('../controllers/indexController');
const folderController = require('../controllers/folderController');

const router = new Router();

router.get('/', indexController.homepageGet);

router.get('/sign-up', authController.signUpGet);
router.post('/sign-up', authController.signUpPost);
router.get('/login', authController.loginGet);
router.post('/login', authController.loginPost);
router.post('/logout', authController.logoutPost);

router.post('/upload', indexController.uploadPost)

router.post('/rename/:folderId', folderController.folderRenamePost);
router.post('/delete/:folderId', folderController.folderDeletePost);
router.post('/new-folder/:folderId', folderController.newFolderPost);
router.get('/:folderId', folderController.folderGet);


module.exports = router;