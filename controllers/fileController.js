const upload = require('../middleware/multerConfig');
const cloudinary = require('../utils/cloudinaryConfig');
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
                    type: result.resource_type,
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

module.exports = {
    uploadFilePost
}