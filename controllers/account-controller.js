const accountModel = require("../models/account-model");

exports.showRegister = (req, res) => {
    let user = req.session.user;
    if (!user) {
        req.session.user = {
            _id: "",
            userName: "",
            role: "",
        };
    }
    res.render("register", {
        user,
        userName: "",
        email: "",
        DOB: "",
        password: "",
        password2: "",
        errors: [],
        success: false,
    });
};

exports.handleRegister = async (req, res) => {
    const userName = (req.body.userName ?? "").trim();
    const email = (req.body.email ?? "").trim();
    const DOB = req.body.dob || "";
    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    const role = req.body.role ?? "user";

    let user = req.session.user;
    if (!user) {
        req.session.user = {
            _id: "",
            userName: "",
            role: "",
        };
    }
    // checks for empty fields and records the error in an array
    let errors = [];
    if (!userName) {
        errors.push("User Name is required");
    }
    if (!email) {
        errors.push("Email is required");
    }

    if (!DOB) {
        errors.push("Date of Birth is required");
    }

    if (!password) {
        errors.push("Password is required");
    } else if (password !== password2) {
        errors.push("Passwords do not match");
    }

    if (errors.length === 0) {
        // no errors; user is registered
        try {
            const result = await accountModel.registerUser(
                userName,
                email,
                DOB,
                password,
                role,
            );
            console.log("Registering user...");
        } catch (error) {
            errors.push(error.message);
        }
    }
    res.render("register", {
        user,
        userName,
        email,
        DOB,
        password,
        password2,
        errors,
        success: errors.length === 0,
    });
};

exports.showLogin = (req, res) => {
    res.render("login", {
        userName: "",
        password: "",
        errors: [],
        success: false,
    });
};

exports.handleLogin = async (req, res) => {
    const userName = (req.body.userName ?? "").trim();
    const password = (req.body.password ?? "").trim();
    let errors = [];

    // checks for empty fields and records the error in an array
    if (!userName) {
        errors.push("User Name is required");
    }
    if (!password) {
        errors.push("Password is required");
    }
    if (errors.length === 0) {
        // if all fields are filled, user authentication is carried out
        const user = await accountModel.authenticateUser(userName, password);
        // checks if user exists in user schema
        if (!user) {
            // if user does not exist, prompts user to register for an account.
            errors.push(
                "Invalid username or password. <br> Try <a href='/register'>registering</a> first.",
            );
            return res.render("login", {
                userName,
                password,
                errors,
                success: false,
            });
        } else {
            // successful login and user session is started
            req.session.user = {
                _id: user._id,
                userName: user.userName,
                role: user.role,
            };
            console.log("Logging user in...");
            console.log("Starting user session...");
            return res.render("login", {
                userName,
                password,
                errors,
                success: true,
            });
        }
    }
    res.render("login", { userName, password, errors, success: false });
};

exports.showProfile = async (req, res) => {
    // displays logged in user's profile
    const userId = req.session.user._id;
    const details = await accountModel.retrieveProfile(userId);
    res.render("user-profile", { details });
};

exports.updateProfile = async (req, res) => {
    // shows update details form for user
    const userId = req.session.user._id;
    // retrieves profile details for user from database and is put as default value for form fields
    const originalDetails = await accountModel.retrieveProfile(userId);
    res.render("edit-user-profile", { originalDetails });
};

exports.processUpdate = async (req, res) => {
    const userName = (req.body.userName ?? "").trim();
    const email = (req.body.email ?? "").trim();
    const DOB = req.body.dob;

    try {
        // updates fields of user profile in database
        await accountModel.updateDetails(
            req.session.user._id,
            userName,
            email,
            DOB,
        );
        console.log("Updated details successfully");
        req.session.user.userName = userName; // updates username variable in session; becauses session captures old snapshot with outdated details
        console.log("new session userName: " + req.session.user.userName);
    } catch (error) {
        console.error("Failed to update user details", error);
    }
    res.redirect("/profile");
};

exports.deleteConfirmation = (req, res) => {
    // displays form for user to enter password to verify deletion
    res.render("delete-user-profile", { error: "" });
};

exports.deleteProfile = async (req, res) => {
    const password = req.body.password;
    // authenticates inputted password before processing deletion
    const match = await accountModel.authenticateUser(
        req.session.user.userName,
        password,
    );
    if (match) {
        await accountModel.deleteUser(req.session.user._id); // deletes user
        console.log("Deleting user...");
        console.log("Destroying the session");
        req.session.destroy(() => {
            // session destroyed
            res.redirect("/index.html"); // redirected to homepage
        });
    } else {
        res.render("delete-user-profile", {
            error: "Wrong password. Please try again.",
        });
    }
};

exports.logout = (req, res) => {
    // destroy session once user is logged out
    console.log("Logging user out...");
    console.log("Destroying the session");
    req.session.destroy(() => {
        res.redirect("/index.html");
    });
};
