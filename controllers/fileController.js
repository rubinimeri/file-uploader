const upload = require('../middleware/multerConfig');
const cloudinary = require('../utils/cloudinaryConfig');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadFilePost = [
    upload.single('file'),
    async (req, res) => {
        const { folderId } = req.params;
        const { user } = req;
        await cloudinary.uploader.upload(req.file.path, async (err, result) => {
            if (err) {
                return res.send("Error uploading");
            }
            await prisma.file.create({
                data: {
                    name: req.file.originalname,
                    size: req.file.size,
                    type: req.file.mimetype,
                    url: result.url,
                    cloudinaryId: result.asset_id,
                    userId: user.id,
                    folderId: folderId,
                }
            })
            res.redirect(`/${folderId}`);
        })
    }
]

async function fileGet(req, res) {
    const { user } = req;
    const { fileId } = req.params;

    if(!user) {
        res.redirect(`/login`);
    }

    if(!fileId) {
        res.status(204).end();
    }

    const file = await prisma.file.findFirst({
        where: { id: fileId }
    })
    res.render('file', { file: file, user: user });
}

async function fileDownloadGet(req, res) {
    const { fileId } = req.params;
    if (!fileId) {
        return res.status(400).send('File id is required');
    }

    try {
        const file = await prisma.file.findFirst({
            where: { id: fileId }
        })

        if(!file) {
            return console.error('Error fetching from database')
        }

        const response = await axios({
            url: file.url,
            method: 'GET',
            responseType: 'stream'
        })

        const { name } = file;

        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

        response.data.pipe(res);

    } catch (err) {
        res.status(500).send('Error downloading file.');
    }
}

module.exports = {
    uploadFilePost,
    fileGet,
    fileDownloadGet
}