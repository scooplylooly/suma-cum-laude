const e = require("express");
const accountModel = require("../models/account-model");
const petModel = require("../models/pet-model");

exports.showAdminPage = async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.send(`
            <h1 style="color: red;">Unauthorized</h1>
            <p><b>You must be logged in to access this page. Redirecting...</b></p>

            <script>
                setTimeout(() => {
                    location.href = "/login"}, 3000);
            </script>
        `);
    } else if (user.role == "admin") {
        return res.render("admin-page", { user });
    } else {
        return res.redirect("/adopt");
    }
};

exports.showIncomingListings = async (req, res) => {
    const pets = (await petModel.getAllPets()).reverse();
    let selectedStatus = "";
    res.render("admin-listings", { pets, selectedStatus });
};

exports.filterListings = async (req, res) => {
    let status = req.body.status;
    let selectedStatus = "";
    let pet;

    if (status === "approved") {
        pets = (await petModel.getAllPets())
            .reverse()
            .filter((pet) => pet.approved);
        selectedStatus = status;
    } else if (status === "pending") {
        pets = (await petModel.getAllPets())
            .reverse()
            .filter((pet) => !pet.approved);
        selectedStatus = status;
    } else {
        selectedStatus = "";
        pets = (await petModel.getAllPets()).reverse();
    }
    return res.render("admin-listings", {
        pets,
        selectedStatus,
    });
};

exports.confirmListingStatus = async (req, res) => {
    let pid = req.query.pid;
    let petFound = await petModel.findPetById(pid);
    return res.render("admin-listing-status", { petFound });
};
exports.updateListingStatus = async (req, res) => {
    let action = req.body.action;
    let pid = req.body.pid;
    let isApproved = action === "approve" ? true : false;
    if (action) {
        await petModel.updatePetApproval(pid, isApproved);
        console.log(`Listing ${isApproved} successfully`);
    }
    return res.redirect("/admin-listings");
};

exports.showUsers = async (req, res) => {
    let adminUserId = req.session.user._id;
    let users = await accountModel.getAllUsers();
    return res.render("admin-users", { users, selectedType: "", adminUserId });
};

exports.filterUsers = async (req, res) => {
    let userType = req.body.userType;
    let adminUserId = req.session.user._id;
    let selectedType = "";
    let users;

    if (userType) {
        users = (await accountModel.getAllUsers())
            .reverse()
            .filter((user) => user.role == userType);
        selectedType = userType;
    } else {
        selectedType = "";
        users = (await accountModel.getAllUsers()).reverse();
    }
    return res.render("admin-users", {
        users,
        selectedType: "",
        adminUserId,
    });
};
exports.displayDeleteUser = async (req, res) => {
    let uid = req.query.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveProfile(uid);
    return res.render("admin-delete-user", { userInfo, error: "" });
};
exports.deleteUser = async (req, res) => {
    let uid = req.body.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveProfile(uid);
    let error = "";
    try {
        await accountModel.deleteUser(uid);
        console.log("user deleted!");
        return res.redirect("/admin-users");
    } catch (err) {
        console.error(err);
        error = "Error deleting user";
    }
    return res.render("admin-delete-user", { userInfo, error });
};

exports.displayUpdateUser = async (req, res) => {
    // shows update details form for user
    // retrieves profile details for user from database
    // and is put as default value for form fields
    const uid = req.query.uid;
    const originalDetails = await accountModel.retrieveProfile(uid);
    console.log("EDITING USER:", originalDetails.userName);
    const userName = originalDetails.userName;
    const email = originalDetails.email;
    const DOB = originalDetails.DOB;
    const role = originalDetails.role;
    return res.render("admin-user-update", {
        userName,
        email,
        DOB,
        role,
        password: "",
        password2: "",
        errors: [],
        uid,
    });
};
exports.updateUser = async (req, res) => {
    const uid = req.body.uid;
    const originalDetails = await accountModel.retrieveProfile(uid);
    const userName =
        (req.body.userName ?? "").trim() || originalDetails.userName;
    const email = (req.body.email ?? "").trim() || originalDetails.email;
    // note that password fields could be left empty if user does not key im values
    // passwords are not shown for security in update page
    const password = (req.body.password ?? "").trim();
    const password2 = (req.body.password2 ?? "").trim();
    const DOB = req.body.dob;
    const role = req.body.role;
    console.log(role);

    let errors = [];
    console.log("Editing user:", originalDetails.userName);
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
            role,
            password: "",
            password2: "",
            errors,
            uid,
        });
    }

    try {
        // updates fields of user profile in database
        await accountModel.updateDetails(uid, userName, email, DOB, password, role);
        console.log("Updated details successfully");
        // updates username variable in session; becauses session captures old snapshot with outdated details
        return res.redirect("/admin-users");
    } catch (error) {
        console.error("Failed to update user details, error:", error);
    }
};

exports.showListerApps = async (req,res) => {
    const pending = await accountModel.getPendingListers();
    res.render("admin-lister-status", { pending });
}

exports.approveLister = async (req,res) => {
    const uid = req.query.uid;
    await accountModel.approveLister(uid);
    res.redirect("admin-lister-status");
}
exports.rejectLister = async (req,res) => {
    const uid = req.query.uid;
    await accountModel.rejectLister(uid);
    res.redirect("admin-lister-status");
};

exports.displayDeleteLister = async (req, res) => {
    let uid = req.query.uid;
    console.log("UID FOUND:", uid);
    let listerInfo = await accountModel.retrieveLister(uid);
    return res.render("admin-delete-lister", { userInfo, error: "" });
};
exports.deleteLister2 = async (req, res) => {
    let uid = req.body.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveLister(uid);
    let error = "";
    try {
        await accountModel.deleteLister2(uid);
        console.log("lister deleted!");
        return res.redirect("/admin-lister");
    } catch (err) {
        console.error(err);
        error = "Error deleting lister";
    }
    return res.render("admin-delete-lister", { listerInfo, error });
};

exports.displayUpdateLister = async (req, res) => {
    // shows update details form for user
    // retrieves profile details for user from database
    // and is put as default value for form fields
    const uid = req.query.uid;
    const originalDetails = await accountModel.retrieveLister(uid);
    console.log("EDITING USER:", originalDetails.userName);
    const address = originalDetails.address;
    const contactNo = originalDetails.contactNo;
    const currentPets = originalDetails.pets;
    const role = originalDetails.role;
    return res.render("admin-user-update", {
        userName,
        address,
        contactNo,
        currentPets,
        role,
        password: "",
        password2: "",
        errors: [],
        uid,
    });
};
exports.updateLister = async (req, res) => {
    const uid = req.body.uid;
    const originalDetails = await accountModel.retrieveLister(uid);
    const userName =
        (req.body.userName ?? "").trim() || originalDetails.userName;
    const address = (req.body.address ?? "").trim() || originalDetails.address;
    const contactNo = (req.body.contactNo ?? "").trim() || originalDetails.contactNo;
    const pets = (req.body.pets ?? "").trim() || originalDetails.pets;
    const experience = (req.body.experience ?? "").trim() || originalDetails.experience;
    const role = req.body.role;
    console.log(role);

    let errors = [];
    console.log("Editing lister:", originalDetails.userName);
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
        return res.render("update-lister-profile", {
            userName,
            address,
            contactNo,
            role,
            pets: "",
            experience: "",
            errors,
            uid,
        });
    }

    try {
        // updates fields of user profile in database
        await accountModel.updateLister(uid, userName, address, contactNo, pets, experience, role);
        console.log("Updated details successfully");
        // updates username variable in session; becauses session captures old snapshot with outdated details
        return res.redirect("/admin-lister");
    } catch (error) {
        console.error("Failed to update lister details, error:", error);
    }
};