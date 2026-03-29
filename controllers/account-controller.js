const accountModel = require("../models/account-model");
const bcrypt = require("bcrypt");

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
            if (req.session.user && req.session.user.role === "admin") {
                return res.redirect("/admin-users");
            }
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

exports.showReset = (req, res) => {
    res.render("reset-form", {
        userName: "",
        email: "",
        errors: [],
        success: false,
    });
};

// handle reset form - validate user + send OTP
exports.handleReset = async (req, res) => {
    const userName = (req.body.userName ?? "").trim();
    const email = (req.body.email ?? "").trim();
    let errors = [];

    // checks if username and email fields are filled in
    if (!userName) {
        errors.push("Username is required");
    }
    if (!email) {
        errors.push("Email is required");
    }

    if (errors.length > 0) {
        return res.render("reset-form", {
            userName,
            email,
            errors,
            success: false,
        });
    }

    try {
        // check user exists with matching username + email
        const user = await accountModel.findUserByNameAndEmail(userName, email);
        if (!user) {
            errors.push(
                "No account found with that username and email.<br> Try <a href='/register'>registering</a> first.",
            );
            console.log("User does not exist");
            return res.render("reset-form", {
                userName: "",
                email: "",
                errors,
                success: false,
            });
        }

        // generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // save OTP to database
        await accountModel.saveOTP(user._id, otp, expiry);


        // store in session for next step
        req.session.resetUserId = user._id;
        res.redirect("/verify-otp");
    } catch (error) {
        console.error(error);
        errors.push("Something went wrong. Please try again.");
        res.render("reset-form", {
            userName: "",
            email: "",
            errors,
            success: false,
        });
    }
};

// show OTP form
exports.showVerifyOtp = (req, res) => {
    if (!req.session.resetUserId) return res.redirect("/forget-password");
    res.render("verify-otp", { errors: [], success: false });
};

// handle OTP verification
exports.handleVerifyOtp = async (req, res) => {
    if (!req.session.resetUserId) return res.redirect("/forget-password");

    const otp = (req.body.otp ?? "").trim();
    const user = await accountModel.retrieveProfile(req.session.resetUserId);

    if (!user || user.otp !== otp) {
        return res.render("verify-otp", {
            errors: ["Invalid OTP. Please try again."],
        });
    }

    if (user.otpExpiry < new Date()) {
        return res.render("verify-otp", {
            errors: ["OTP has expired. Please request a new one."],
        });
    }

    req.session.otpVerified = true;
    console.log("OTP verified");
    res.redirect("/new-password");
};

// show new password form
exports.showNewPassword = (req, res) => {
    if (!req.session.otpVerified) {
        return res.redirect("/forget-password");
    }
    res.render("new-password", { errors: [], success: false });
};

// handle new password submission
exports.handleNewPassword = async (req, res) => {
    if (!req.session.otpVerified) return res.redirect("/forget-password");

    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    let errors = [];

    if (!password) {
        errors.push("Password is required");
    }
    if (password !== password2) {
        errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
        return res.render("new-password", { errors, success: false });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        await accountModel.updatePassword(req.session.resetUserId, hashed);
        console.log("Resetting password...");

        // clear session reset flags
        delete req.session.otpVerified;
        delete req.session.resetUserId;
        console.log("Deleting reset flags...");

        res.render("new-password", { errors: [], success: true });
    } catch (error) {
        console.error(error);
        res.render("new-password", {
            errors: ["Failed to reset password."],
            success: false,
        });
    }
};

exports.showProfile = async (req, res) => {
    // displays logged in user's profile
    const userId = req.session.user._id;
    const details = await accountModel.retrieveProfile(userId);
    res.render("user-profile", { details });
};

exports.updateProfile = async (req, res) => {
    // shows update details form for user
    // retrieves profile details for user from database
    // and is put as default value for form fields
    const originalDetails = await accountModel.retrieveProfile(
        req.session.user._id,
    );
    const userName = originalDetails.userName;
    const email = originalDetails.email;
    const DOB = originalDetails.DOB;
    res.render("update-user-profile", {
        userName,
        email,
        DOB,
        password: "",
        password2: "",
        errors: [],
    });
};

exports.processUpdate = async (req, res) => {
    const originalDetails = await accountModel.retrieveProfile(
        req.session.user._id,
    );
    const userName =
        (req.body.userName ?? "").trim() || originalDetails.userName;
    const email = (req.body.email ?? "").trim() || originalDetails.email;
    // note that password fields could be left empty if user does not key im values
    // passwords are not shown for security in update page
    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    const DOB = req.body.dob;
    let errors = [];

    if (
        userName !== originalDetails.userName &&
        (await accountModel.checkUserExist(userName))
    ) {
        errors.push("Username already exists");
    }

    if (password !== password2) {
        errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
        return res.render("update-user-profile", {
            userName,
            email,
            DOB,
            password: "",
            password2: "",
            errors,
        });
    }

    try {
        // updates fields of user profile in database
        await accountModel.updateDetails(
            req.session.user._id,
            userName,
            email,
            DOB,
            password,
            originalDetails.role,
        );
        console.log("Updated details successfully");
        // updates username variable in session; becauses session captures old snapshot with outdated details
        req.session.user.userName = userName;
        console.log(
            "Updated current session userName: " + req.session.user.userName,
        );
        res.redirect("/profile");
    } catch (error) {
        console.error("Failed to update user details, error:", error);
    }
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
