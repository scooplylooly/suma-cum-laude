exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/login');
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in, resdirecting to /login");
        return res.redirect("/login");
    }
    if (req.session.user.role!=="admin") {
        console.log("Not an admin user, redirecting to /profile");
        res.redirect("/profile");
    }
}