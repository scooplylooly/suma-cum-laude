const indexModel = require("../models/index-model");

exports.showLogin = (req, res) => {
    res.render("sign-in", { userName: '', password: '', errors: [], success: false });
};

exports.handleLogin = async (req, res) => {
    let userName = (req.body.userName ?? "").trim();
    let password = (req.body.password ?? "").trim();
    let errors = [];
    
    if (!userName) {
        errors.push("User Name is required");
    }
    if (!password) {
        errors.push("Password is required");
    }
    if (errors.length === 0) {
        const user = await indexModel.authenticateUser(userName, password);
        if (!user) {
            errors.push("Invalid username or password. <br> Try <a href='/sign-up'>registering</a> first.");
            return res.render("sign-in", {userName, password, errors, success: false});
        } else {
            req.session.user = {_id: user._id, userName: user.userName}
            return res.render("sign-in", {userName, password, errors, success: true});
        }

    }
    res.render("sign-in", { userName, password, errors, success: false});
};

exports.showRegister = (req, res) => {
    res.render("sign-up", { userName:'', email: '', DOB: '', password: '', password2:'', errors: [], success: false });
};


exports.handleRegister = async (req, res) => {
    let userName = (req.body.userName ?? "").trim();
    let email = (req.body.email ?? "").trim();
    let DOB = req.body.dob || "";
    let password = (req.body.password ?? "").trim();
    let password2 = (req.body.password2 ?? "").trim();

    let errors = [];
    if (!userName) {
        errors.push("User Name is required");
    }
    if (!email) {
        errors.push("Email is required");
    }

    if(!DOB){
        errors.push("Date of Birth is required")
    }
    
    if (!password) {
        errors.push("Password is required");

    } else if (password !== password2) {
        errors.push("Passwords do not match")
    }

    if (errors.length === 0) {
        try {
            const result = await indexModel.registerUser(userName, email, DOB, password);

        } catch (error) {
            errors.push(error.message);
        }
    }
    res.render("sign-up", { userName,email, DOB, password, password2, errors, success: errors.length === 0});
};

exports.showLister = (req, res) => {
    res.render("apply-lister", userName, password, password2, errors = [])
}

exports.handleLister = async (req, res) => {
    let userNameL = (req.body.userNameL ?? "").trim()
    let passwordL = (req.body.passwordL ?? "").trim()
    let password2L = (req.body.password2L ?? "").trim()

    let errors = []
    if (!userNameL) {
        errors.push("Username is required")
    }

    if (!passwordL) {
        errors.push("Password is required")
    }

    if (!password2L || passwordL !== password2L) {
        errors.push("Passwords do not match")
    }

    res.render("apply-lister", {userNameL, passwordL, password2L})
}