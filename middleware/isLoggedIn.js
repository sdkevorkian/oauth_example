module.exports = function(req, res, next) {
    if (!req.user) {
        req.flash('error, not logged in to view this page');
        res.redirect('/auth/login'); // need to log in
    } else {
        next(); // keep going
    }
}
