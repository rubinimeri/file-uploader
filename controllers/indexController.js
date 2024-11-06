function homepageGet(req, res) {
    const { user } = req;
    if(!user) {
        return res.render('home', { user: null })
    }
    res.render('home', { user: user });
}

module.exports = {
    homepageGet
}