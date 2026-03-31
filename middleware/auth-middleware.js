exports.isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        console.log("Not an admin user, redirecting to /login");
        return res.send(`
            <h1 style="color: red;">Unauthorized</h1>
            <p><b>You must be an admin/logged in to access this page. Redirecting...</b></p>
            <script>
                setTimeout(() => {
                    location.href = "/login"
                }, 3000);
            </script>
        `);
    }
    next();
};

exports.checkUser = (req, res, next) => {
    if (!req.session.user) {
        return res.send(`
            <h2>Session expired! Redirecting to log in page...</h2>
            <script>
                setTimeout(() => {
                    location.href = "/login"
                }, 2000);
            </script>
        `);
    }
    next();
};

exports.verifiedIdentity = (req, res, next) => {
    if (!req.session.verified) {
        return res.redirect("/login");
    }
    next();
};

exports.isLister = (req, res, next) => {
    if (!req.session.user || req.session.user.role == "user") {
        console.log("Not a lister/admin user, redirecting to /login");
        return res.send(`
            <h1 style="color: red;">Unauthorized</h1>
            <p><b>You must be a lister/logged in to access this page. Redirecting...</b></p>
            <script>
                setTimeout(() => {
                    location.href = "/login"
                }, 3000);
            </script>
        `);
    }
    next();
};
