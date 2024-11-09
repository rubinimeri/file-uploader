const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../utils/cloudinaryConfig');
const prisma = new PrismaClient();

// Recursively delete folders & files
async function deleteFolders(currentFolderId) {
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
        for (const file of currentFolder.files) {
            // Delete from database
            await prisma.file.delete({ where: { id: file.id } });

            // Delete from cloudinary
            const { public_id } = await cloudinary.api.resource_by_asset_id(file.cloudinaryId);
            await cloudinary.uploader.destroy(public_id);
        }
    }

    // If current folder has folders, recursively delete them
    if (currentFolder.folders.length !== 0) {
        for (const folder of currentFolder.folders) {
            await deleteFolders(folder.id)
        }
    }

    // Delete currentFolder
    await prisma.folder.delete({where: {id: currentFolder.id}});
}

module.exports = deleteFolders;
