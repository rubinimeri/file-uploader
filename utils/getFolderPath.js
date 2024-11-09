const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// While folder has a parent, then store that parent
// in an array with its id & name, repeat until parent
// is null

async function getFolderPath(currentFolders) {
    const length = currentFolders.length - 1;
    if (!currentFolders[length].parentId)
        return currentFolders.reverse();

    const { id, name, parentId } = await prisma.folder.findFirst({
        where: {
            id: currentFolders[length].parentId
        },
    })
    currentFolders.push({ id, name, parentId });
    return await getFolderPath(currentFolders);

}

module.exports = getFolderPath;