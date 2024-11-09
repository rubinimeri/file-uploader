const { Router } = require('express');
const folderController = require("../controllers/folderController");

const folderRouter = Router();

folderRouter.post('/rename/:folderId', folderController.folderRenamePost);
folderRouter.post('/delete/:folderId', folderController.folderDeletePost);
folderRouter.post('/new-folder/:folderId', folderController.newFolderPost);
folderRouter.get('/:folderId', folderController.folderGet);

module.exports = folderRouter;