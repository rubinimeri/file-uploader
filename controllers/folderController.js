const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../utils/cloudinaryConfig');
const CustomError = require('../utils/customError');
const asyncHandler = require("express-async-handler");
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


    // While folder has a parent, then store that parent
    // in an array with its id & name, repeat until parent
    // is null

    async function getFolders(currentFolders = [{
        id: rootFolder.id,
        name: rootFolder.name,
        parentId: rootFolder.parentId
    }]) {
        try {

            if (!currentFolders[currentFolders.length - 1].parentId) {
                return currentFolders;
            }
            const parentFolder = await prisma.folder.findFirst({
                where: {id: currentFolders[currentFolders.length - 1].parentId},
            })
            currentFolders.push({id: parentFolder.id, name: parentFolder.name, parentId: parentFolder.parentId});
            return await getFolders(currentFolders);

        } catch (err) {
            throw new CustomError(err.message, err.statusCode);
        }
    }

    const folders = (await getFolders()).reverse();

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

    // Recursively delete folders & files
    async function deleteFolders(currentFolderId = folder.id) {
        try {
            // If there is no folder id, return
            if (!currentFolderId)
                return;

            const currentFolder = await prisma.folder.findFirst({
                where: {
                    id: currentFolderId,
                },
                include: {folders: true, files: true}
            })

            // If currentFolder has files then delete them
            if (currentFolder.files.length !== 0) {
                currentFolder.files.forEach(async (file) => {
                    // Delete from database
                    await prisma.file.delete({ where: { id: file.id } });

                    // Delete from cloudinary
                    const { public_id } = await cloudinary.api.resource_by_asset_id(file.cloudinaryId);
                    await cloudinary.uploader.destroy(public_id);
                })
            }

            // Delete currentFolder
            await prisma.folder.delete({where: {id: currentFolder.id}});

            // If current folder has folders, recursively delete them
            if (currentFolder.folders.length !== 0) {
                currentFolder.folders.forEach(async (folder) => {
                    await deleteFolders(folder.id)
                })
            }
        } catch (err) {
            throw new CustomError(err.message, err.statusCode)
        }
    }

    deleteFolders();
    res.redirect(`/my-files/${folder.parentId}`);
})

module.exports = {
    folderGet,
    newFolderPost,
    folderRenamePost,
    folderDeletePost
}