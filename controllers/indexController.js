const upload = require('../middleware/multerConfig');

function homepageGet(req, res) {
    const { user } = req;
    if(!user) {
        return res.render('home', { user: null })
    }
    res.render('home', { user: user });
}

const uploadPost = [
    upload.single('file'),
    (req, res) => {
        const { file } = req;
        file.filename += '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
        console.log(file);
        res.redirect('/');
    }
]

module.exports = {
    homepageGet,
    uploadPost,
}