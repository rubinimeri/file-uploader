const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function folderGet(req, res) {
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
        if (!currentFolders[currentFolders.length-1].parentId) {
            return currentFolders;
        }
        const parentFolder = await prisma.folder.findFirst({
            where: { id: currentFolders[currentFolders.length - 1].parentId },
        })
        currentFolders.push({ id: parentFolder.id, name: parentFolder.name, parentId: parentFolder.parentId });
        return await getFolders(currentFolders);
    }

    const folders = (await getFolders()).reverse();

    res.render('folder', { folder: rootFolder, user: user, folders: folders });
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