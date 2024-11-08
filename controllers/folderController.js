const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function folderGet(req, res) {
    const { user } = req;
    const { folderId } = req.params;

    if(!user) {
        return res.redirect('/login');
    }

    const rootFolder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
        include: { folders: true }
    })

    console.log(rootFolder)

    res.render('folder', { folder: rootFolder, user: user });
}

async function newFolderPost(req, res) {
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
    res.redirect(`/${folderId}`);
}

async function folderRenamePost(req, res) {
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
    res.redirect(`/${folder.parentId}`);
}

async function folderDeletePost(req, res) {
    const { folderId } = req.params;
    const folder = await prisma.folder.delete({
        where: {
            id: folderId,
        },
    })
    res.redirect(`/${folder.parentId}`);
}

module.exports = {
    folderGet,
    newFolderPost,
    folderRenamePost,
    folderDeletePost
}