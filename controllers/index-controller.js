const indexModel = require("../models/index-model");

exports.showLogin = (req, res) => {
    res.render("sign-in", { userName: '', password: '', errors: [] });
};

exports.handleLogin = async (req, res) => {
    let userName = (req.body.userName ?? "").trim();
    let password = req.body.password;
    let errors = []
    
    if (!userName) {
        errors.push("User Name is required");
    }
    if (!password) {
        errors.push("Password is required");
    }
    if (errors.length === 0) {
        const isLoggedIn = await indexModel.authenticateUser(userName, password);
        if (!isLoggedIn) {
            errors.push("Invalid username or password. <br> Try <a href='/sign-up'>registering</a> first.");
        }
    }
    res.render("sign-in", { userName, password, errors });
    // res.redirect("/AdoptNow"); // uncomment later
};

exports.showRegister = (req, res) => {
    res.render("sign-up", { userName:'', email: '', DOB: '', password: '', password2:'', errors: [] });
};


exports.handleRegister = async (req, res) => {
    let userName = (req.body.userName ?? "").trim();
    let email = (req.body.email ?? "").trim();
    let DOB = req.body.dob || "";
    let password = req.body.password.trim() || "";
    let password2 = req.body.password2.trim() || "";

    let errors = [];
    if (!userName) {
        errors.push("Name");
    }
    if (!email) {
        errors.push("Email");
    }

    if(!DOB){
        errors.push("Date of Birth")
    }
    if (!password) {
        errors.push("Password");
    }
    if (password !== password2) {
        errors.push("password again");
    }

    if (errors.length === 0) {
        try {
            await indexModel.registerUser(userName, email, DOB, password);
        } catch (err) {
            errors.push(err.message);
        }
    }
    res.render("sign-up", { userName,email, DOB, password, password2, errors });
};


// exports.handleSubmission = async (req, res) => {
//   selectedCategory = req.body.category;

//   try {
//     const items = await Stock.getAllRecords();

//     filteredItems = {};
//     for (const key in items) {
//       if (items[key] === selectedCategory) {
//         filteredItems[key] = items[key];
//       }
//     }

//     res.render("display-form", {
//       selectedCategory: selectedCategory  null,
//       filteredItems: selectedCategory ? filteredItems : null,
//     });
//   } catch (error) {
//     console.error("Error reading data:", error);
//   }
// };