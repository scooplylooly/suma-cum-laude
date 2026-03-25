// to conduct a check on whether user is logged in;if true, clicking login brings to profile instead of prompting for login details
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/profile");
    }
    next();
};

// checks if user has admin access
exports.isAdmin = (req, res, next) => {
    if (req.session.user.role!=="admin") {
        console.log("Not an admin user, redirecting to /profile");
        res.redirect("/profile");
    }
};