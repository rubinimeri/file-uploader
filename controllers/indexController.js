const upload = require('../middleware/multerConfig');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function homepageGet(req, res) {
    const { user } = req;
    if(!user) {
        return res.render('home', { user: null })
    }
    const rootFolder = await prisma.folder.findFirst({
        where: { parentId: null, userId: user.id },
    })
    res.render('home', { user: user, rootFolder: rootFolder });
}

module.exports = {
    homepageGet,
}