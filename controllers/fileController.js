const upload = require('../middleware/multerConfig');
const cloudinary = require('../utils/cloudinaryConfig');
const CustomError = require('../utils/customError');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadFilePost = [
    upload.single('file'),
    asyncHandler(async (req, res) => {
        const { folderId } = req.params;
        const { user } = req;
        await cloudinary.uploader.upload(req.file.path, async (err, result) => {
            if (err) {
                throw new CustomError(err.message, err.statusCode);
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
            res.redirect(`/my-files/${folderId}`);
        })
    })
]

const fileGet = asyncHandler(async (req, res) => {
    const { user } = req;
    const { fileId } = req.params;

    const file = await prisma.file.findFirst({
        where: { id: fileId }
    })
    res.render('file', { file: file, user: user });
})

const fileDownloadGet = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

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
})

const fileDeleteGet = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    // Delete from database
    const file = await prisma.file.delete({ where: { id: fileId } });

    // Delete from cloudinary
    const { public_id } = await cloudinary.api.resource_by_asset_id(file.cloudinaryId);
    await cloudinary.uploader.destroy(public_id);
    res.redirect(`/my-files/${file.folderId}`);
})

const fileRenamePost =  asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const { newName } = req.body;

    const file = await prisma.file.update({
        where: { id: fileId },
        data: { name: newName }
    })
    res.redirect(`/my-files/${file.folderId}`);
})

module.exports = {
    uploadFilePost,
    fileGet,
    fileDownloadGet,
    fileDeleteGet,
    fileRenamePost
}