const { PrismaClient } = require('@prisma/client');
const asyncHandler = require("express-async-handler");
const deleteFolders = require('../utils/deleteFolders');
const getFolderPath = require('../utils/getFolderPath');
const prisma = new PrismaClient();

const folderGet = asyncHandler(async (req, res) => {
    const { user } = req;
    const { folderId } = req.params;

    if(!user) {
        return res.redirect('/login');
    }

    // Ignore requests for favicon.ico
    if (folderId === 'favicon.ico') {
        return res.status(204).end(); // Respond with no content
    }

    const rootFolder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
        include: { folders: true, files: true }
    });

    const folders = await getFolderPath([{
        id: rootFolder.id,
        name: rootFolder.name,
        parentId: rootFolder.parentId
    }]);

    res.render('folder', { folder: rootFolder, user: user, folders: folders });
})

const newFolderPost = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const { user } = req;
    const { folderName } = req.body;

    const subFolder = await prisma.folder.create({
        data: {
            name: folderName,
            userId: user.id,
            parentId: folderId
        }
    })
    res.redirect(`/my-files/${folderId}`);
})

const folderRenamePost = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const { newName } = req.body;

    const folder = await prisma.folder.update({
        where: {
            id: folderId,
        },
        data: {
            name: newName,
        },
    })
    res.redirect(`/my-files/${folder.parentId}`);
})

const folderDeletePost = asyncHandler(async (req, res) => {
    const { folderId } = req.params;

    const folder = await prisma.folder.findFirst({
        where: {
            id: folderId,
        },
        include: {folders: true, files: true}
    })

    await deleteFolders(folder.id);

    res.redirect(`/my-files/${folder.parentId}`);
})

module.exports = {
    folderGet,
    newFolderPost,
    folderRenamePost,
    folderDeletePost
}