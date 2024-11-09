const { Router } = require('express');
const fileController = require("../controllers/fileController");

const fileRouter = Router();

fileRouter.get('/:fileId', fileController.fileGet);
fileRouter.get('/delete/:fileId', fileController.fileDeleteGet)
fileRouter.get('/download/:fileId', fileController.fileDownloadGet);
fileRouter.post('/upload/:folderId', fileController.uploadFilePost);
fileRouter.post('/rename/:fileId', fileController.fileRenamePost);

module.exports = fileRouter;