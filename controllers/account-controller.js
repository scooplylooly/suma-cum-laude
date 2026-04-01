const accountModel = require("../models/account-model");
const bcrypt = require("bcrypt");

exports.showRegister = (req, res) => {
    let user = req.session.user;
    // initialises user session; information is needed in ejs template
    if (!user) {
        req.session.user = {
            _id: "",
            userName: "",
            role: "",
        };
    }
    // renders registration form with empty fields
    res.render("register", {
        user,
        userName: "",
        email: "",
        DOB: "",
        password: "",
        password2: "",
        securityKey: "",
        errors: [],
        success: false,
    });
};

exports.handleRegister = async (req, res) => {
    // checks for valid inputs
    const userName = (req.body.userName ?? "").trim();
    const email = (req.body.email ?? "").trim();
    const DOB = req.body.dob || "";
    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    const securityKey = (req.body.securityKey ?? "").trim();
    // role is defaulted to user since only admins can register other account roles such as admin / lister
    const role = req.body.role || "user";
    // check to see if user session is already active
    // if session is active, registration ejs file checks if user role is admin
    const user = req.session.user ?? null;
    // checks for invalid inputs and records the error in an array
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
    } else {
        // checks if password meets mininum requirements for security purposes
        const checkSecure = accountModel.securePassword(password);
        if (checkSecure !== true) {
            // catches the errors and append to error array
            for (let error of checkSecure) {
                errors.push(error);
            }
        }
    }

    if (!securityKey) {
        errors.push("Security question input is required");
    }

    if (errors.length === 0) {
        // no errors; user is registered and data added to users schema
        try {
            await accountModel.registerUser(
                userName,
                email,
                DOB,
                password,
                securityKey,
                role,
            );
            console.log("Registering user...");
            if (req.session.user && req.session.user.role === "admin") {
                return res.redirect("/admin/users");
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
        securityKey,
        errors,
        success: errors.length === 0,
    });
};

exports.showLogin = (req, res) => {
    // renders form with empty fields
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

    // checks for invalid inputs and records the error to array
    if (!userName) {
        errors.push("User Name is required");
    }
    if (!password) {
        errors.push("Password is required");
    }
    if (errors.length === 0) {
        // if all fields are filled and inputs valid, user authentication is implemented
        const user = await accountModel.authenticateUser(userName, password);
        // checks if user exists in user schema
        if (!user) {
            // prompts user to register for an account if user does not exist
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
            // successful login and creates new user session
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

exports.showVerify = (req, res) => {
    // renders vefification form with empty fields
    res.render("verify-identity", {
        userName: "",
        securityKey: "",
        errors: [],
        success: false,
    });
};

// handle verification form - validates user + verify security key
exports.handleVerify = async (req, res) => {
    const userName = (req.body.userName ?? "").trim();
    const securityKey = (req.body.securityKey ?? "").trim();
    let errors = [];

    // checks for invalid inputs and records errors to array
    if (!userName) {
        errors.push("Username is required");
    }
    if (!securityKey) {
        errors.push(
            "Please answer the security question to verify your identity",
        );
    }
    if (errors.length > 0) {
        // re-renders form with identifed input errors
        res.render("verify-identity", {
            userName,
            securityKey,
            errors,
            success: false,
        });
    } else {
        try {
            // checks whether another user with matching username exists in database; to ensure username is unique
            let errors = [];
            const user = await accountModel.checkUserExist(userName);
            if (!user) {
                // prompts user to register if user not found in database
                errors.push(
                    "No account found with that username. <br> Try <a href='/register'>registering</a> first.",
                );
                console.log("User does not exist");

                // authentication of security key
            } else {
                const checkPass = await accountModel.checkSecurityKey(
                    userName,
                    securityKey,
                );
                if (!checkPass) {
                    errors.push("Incorrect security key");
                }
            }
            if (errors.length === 0) {
                // setting up user data and verification flag in session temporarily
                req.session.resetUser = userName;
                req.session.verified = true;
                console.log("User verified and userName recorded... ");
                console.log(
                    `Current session user: ${req.session.resetUser}, verified identity: (${req.session.verified})`,
                );
            }
            res.render("verify-identity", {
                userName,
                securityKey,
                errors,
                success: errors.length === 0,
            });
        } catch (error) {
            console.error(error);
            errors.push("Something went wrong. Please try again.");
            res.render("verify-identity", {
                userName: "",
                securityKey: "",
                errors,
                success: false,
            });
        }
    }
};

// renders reset password form with empty fields
exports.showResetPassword = (req, res) => {
    res.render("reset-password", {
        password: "",
        password2: "",
        errors: [],
        success: false,
    });
};

// handle new password submission
exports.handleResetPassword = async (req, res) => {
    // this value is captured from prev verification page using hidden input
    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    let errors = [];

    // check for invalid inputs and record errors to array
    if (!password) {
        errors.push("Password is required");
    } else if (password !== password2) {
        errors.push("Passwords do not match");
    } else {
        const checkSecure = accountModel.securePassword(password);
        if (checkSecure !== true) {
            for (let error of checkSecure) {
                errors.push(error);
            }
        }
    }

    if (errors.length > 0) {
        return res.render("reset-password", {
            password,
            password2,
            errors,
            success: false,
        });
    }

    try {
        // hashes password for security
        const hashedPassword = await bcrypt.hash(password, 10);
        // resets password for specified user in database
        await accountModel.updatePassword(
            req.session.resetUser,
            hashedPassword,
        );
        console.log("Resetting password...");
        // deletes verifiation flag and temporary user data in session
        delete req.session.verified;
        delete req.session.resetUser;
        console.log("Deleting verified flag...");
        // deletes the verified check from session;
        res.render("reset-password", {
            password,
            password2,
            errors: [],
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.render("reset-password", {
            password,
            password2,
            errors: ["Failed to reset password."],
            success: false,
        });
    }
};

exports.showProfile = async (req, res) => {
    // displays user's profile if they are logged in
    const details = await accountModel.retrieveProfile(req.session.user._id);
    const listerApplication = await accountModel.retrieveLister(
        req.session.user._id,
    );
    if (details) {
        req.session.user.role = details.role;
        req.session.user.userName = details.userName;
    }
    const user = req.session.user;
    res.render("user-profile", { details, user, listerApplication });
};

exports.updateProfile = async (req, res) => {
    // retrieves profile details for user from database + details put as default value for form fields when form is rendered
    const originalDetails = await accountModel.retrieveProfile(
        req.session.user._id,
    );
    const userName = originalDetails.userName;
    const email = originalDetails.email;
    const DOB = originalDetails.DOB;
    const securityKey = originalDetails.securityKey;
    // password is not displayed in the fields for security reasons
    res.render("update-user-profile", {
        userName,
        email,
        DOB,
        password: "",
        password2: "",
        securityKey,
        errors: [],
    });
};

exports.processUpdate = async (req, res) => {
    // if inputs are not valid, field inputs are by default set to data recorded in user's orginal profile
    const originalDetails = await accountModel.retrieveProfile(
        req.session.user._id,
    );
    const userName =
        (req.body.userName ?? "").trim() || originalDetails.userName;
    const email = (req.body.email ?? "").trim() || originalDetails.email;
    // note that password fields could be left empty if user does not key im values
    // passwords are not shown for security in update page
    const DOB = req.body.dob;
    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    const securityKey =
        (req.body.securityKey ?? "").trim() || originalDetails.securityKey;
    const role = originalDetails.role; // role cannot be updated by user; defaulted to original role in database
    let errors = [];
    // if username inputted is not same as original name, check if another user with same username exists
    if (
        userName !== originalDetails.userName &&
        (await accountModel.checkUserExist(userName))
    ) {
        errors.push("Username already exists");
    }

    if (password !== password2) {
        errors.push("Passwords do not match");
    } else {
        if (password && password2) {
            const checkSecure = accountModel.securePassword(password);
            if (checkSecure !== true) {
                for (let error of checkSecure) {
                    errors.push(error);
                }
            }
        }
    }

    if (errors.length > 0) {
        return res.render("update-user-profile", {
            userName,
            email,
            DOB,
            password,
            password2,
            securityKey,
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
            securityKey,
            role,
        );
        console.log("Updated details successfully");
        // updates username variable in session; session captures old snapshot with outdated details
        req.session.user.userName = userName;
        console.log(
            "Updated current session userName: " + req.session.user.userName,
        );
        res.redirect("/profile");
    } catch (error) {
        console.error("Failed to update user details, error:", error);
    }
};

exports.deleteConfirmation1 = (req, res) => {
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
        await accountModel.deleteListerByUid(req.session.user._id);
        await accountModel.deleteUser(req.session.user._id); // deletes user
        console.log("Deleting user...");
        console.log("Destroying the session");
        req.session.destroy(() => {
            // session destroyed
            res.redirect("/index.html"); // redirected to introduction homepage
        });
    } else {
        res.render("delete-user-profile", {
            error: "Wrong password. Please try again.",
        });
    }
};
// lister related controllers below
exports.showLister = (req, res) => {
    const user = req.session.user;
    res.render("apply-lister", {
        user,
        address: "",
        contactNo: "",
        reason: "",
        pets: "",
        experience: "",
        errors: [],
        success: false,
    });
};

exports.handleLister = async (req, res) => {
    let userId = req.session.user._id;
    let userName = req.session.user.userName;
    let username = req.body.username ? req.body.username.trim() : "";
    let address = (req.body.address ?? "").trim();
    let contactNo = (req.body.contactNo ?? "").trim();
    let reason = (req.body.reason ?? "").trim();
    let pets = (req.body.pets ?? "").trim();
    let experience = (req.body.experience ?? "").trim();

    let errors = [];

    if (!address) {
        errors.push("Address is required");
    }

    if (!contactNo) {
        errors.push("Contact Number is required");
    }

    if (!reason) {
        errors.push("A reason is required");
    }

    if (!pets) {
        errors.push("Pet(s) is required");
    }

    if (!experience) {
        errors.push("Experience field is required");
    }

    if (errors.length > 0) {
        return res.render("apply-lister", {
            address,
            contactNo,
            reason,
            pets,
            experience,
            errors,
            success: false,
        });
    }

    try {
        if (username.length > 0) {
            try {
                const newUser = await accountModel.findUserByName(username);
                userId = newUser._id;
                userName = newUser.userName;
            } catch (err) {
                errors.push(
                    "Username not found. Please enter a valid username.",
                );
                return res.render("apply-lister", {
                    address,
                    contactNo,
                    reason,
                    pets,
                    experience,
                    errors,
                    success: false,
                });
            }
        }
        const exists = await accountModel.retrieveLister(userId);
        if (exists && exists.statusL === "pending") {
            errors.push("Your application is pending.");
            return res.render("apply-lister", {
                address: "",
                contactNo: "",
                reason: "",
                pets: "",
                experience: "",
                errors,
                success: false,
            });
        }
        await accountModel.addLister({
            uid: userId.toString(),
            userName,
            address,
            contactNo,
            reason,
            pets,
            experience,
            statusL: "pending",
        });
        return res.redirect("/adopt");
    } catch (err) {
        errors.push(err.message || "Failed to register as lister");
        return res.render("apply-lister", {
            address,
            contactNo,
            reason,
            pets,
            experience,
            errors,
            success: false,
        });
    }
};

exports.updateLister = async (req, res) => {
    const userId = req.session.user._id.toString();
    const originalDetails = await accountModel.retrieveLister(userId);

    if (!originalDetails) {
        req.session.user.role = "user";
        return res.redirect("/profile");
    }
    return res.render("update-lister-profile", { originalDetails });
};

exports.processLister = async (req, res) => {
    const userId = req.session.user._id.toString();
    const originalDetails = await accountModel.retrieveLister(userId);

    const address = (req.body.address ?? "").trim();
    const contactNo = (req.body.contactNo ?? "").trim();
    const pets = (req.body.pets ?? "").trim();
    const experience = (req.body.experience ?? "").trim();

    try {
        await accountModel.updateLister(
            originalDetails._id,
            address,
            contactNo,
            pets,
            experience,
        );
        console.log("Updated details successfully");
    } catch (error) {
        console.error("Failed to update user details", error);
    }
    res.redirect("/profile");
};

exports.showListerStatus = async (req, res) => {
    const userId = req.session.user._id.toString();
    const userName = req.session.user.userName;

    try {
        const application = await accountModel.retrieveLister(userId);

        if (!application) {
            return res.render("lister-application-status", {
                hasApplication: false,
                status: null,
                userName,
            });
        }
        return res.render("lister-application-status", {
            hasApplication: true,
            status: application.statusL,
            userName,
        });
    } catch (err) {
        console.error("Error fetching lister applications:", err);
        return res.render("lister-application-status", {
            hasApplication: false,
            status: null,
            userName,
        });
    }
};

exports.deleteConfirmationForLister = (req, res) => {
    // displays form for user to enter password to verify deletion
    res.render("delete-lister-profile", { error: "" });
};

exports.deleteLister = async (req, res) => {
    const password = req.body.password;
    // authenticates inputted password before processing deletion
    const userName = req.session.user.userName;
    const userId = req.session.user._id.toString();

    const match = await accountModel.authenticateUser(userName, password);
    if (!match) {
        return res.render("delete-lister-profile", {
            error: "Wrong password. Please try again.",
        });
    }

    try {
        await accountModel.deleteListerByUid(userId); // deletes user
        await accountModel.updateUserRole(userId, "user");

        req.session.user.role = "user";

        console.log("Deleting lister profile...");
        return res.redirect("/profile");
    } catch (err) {
        console.error("Failed to delete lister profile:", err);
        return res.render("delete-lister-profile", {
            error: "Failed to delete lister profile.",
        });
    }
};

exports.logout = (req, res) => {
    // destroy user session once user is logged out
    console.log("Logging user out...");
    console.log("Destroying the session");
    req.session.destroy(() => {
        res.redirect("/index.html"); // redirected to introduction homepage
    });
};

//Preferences Logic

const animalTypes = [
    "dog",
    "cat",
    "rabbit",
    "hamster",
    "bird",
    "guinea pig",
    "other",
];
const petPersonalities = [
    "affectionate",
    "independent",
    "playful",
    "curious",
    "gentle",
    "vocal",
    "shy",
    "bold",
    "couch potato",
    "hunter",
    "social",
    "energetic",
    "loyal",
    "friendly",
    "protective",
    "calm",
    "smart",
    "goofy",
    "cuddly",
    "adventurous",
    "sweet",
    "relaxed",
    "outgoing",
    "loving",
    "resilient",
    "chatty",
    "foodie",
    "active",
];
petPersonalities.sort();
exports.userPreferenceForm = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const userInfo = await accountModel.retrieveProfile(userId);
        const userPref = userInfo.preferences;
        console.log("user preferences:", userPref);
        res.render("user-preferences", {
            userPref,
            userId,
            animalTypes,
            petPersonalities,
        });
    } catch (error) {
        console.log(error);
        res.redirect("/preferences");
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const userInfo = await accountModel.retrieveProfile(userId);
        const userPref = userInfo.preferences;
        const housingType = req.body.housingType || "";
        const preferredAnimal = req.body.preferredAnimal || [];
        const preferredTraits = req.body.preferredTraits || [];
        const experienceLevel =
            req.body.experienceLevel || userPref.experienceLevel;
        const activityLevel = req.body.activityLevel || userPref.activityLevel;

        const preferences = {
            housingType: housingType,
            preferredAnimal: preferredAnimal,
            preferredTraits: preferredTraits,
            experienceLevel: experienceLevel,
            activityLevel: activityLevel,
        };
        await accountModel.updatePreferences(userId, preferences);
        console.log("Success");
        res.redirect("/profile");
    } catch (error) {
        console.log(error);
        res.redirect("/preferences");
    }
};
