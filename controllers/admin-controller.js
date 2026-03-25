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
                    location.href = "/sign-in"}, 3000);
            </script>
        `);
    }
    res.render("admin-page", { user });
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
    res.render("admin-listing-status", { petFound });
};
exports.updateListingStatus = async (req, res) => {
    let action = req.body.action;
    let pid = req.body.pid;
    let isApproved = action === "approve" ? true : false;
    if (action) {
        await petModel.updatePetApproval(pid, isApproved);
        console.log(`Listing ${isApproved} successfully`);
    }
    res.redirect("/admin-listings");
};

exports.showUsers = async (req, res) => {
    let users = await accountModel.getAllUsers();
    res.render("admin-users", { users, selectedType: "" });
};

exports.filterUsers = async (req, res) => {
    let userType = req.body.userType;
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
        selectedType,
    });
};
exports.displayDeleteUser = async (req, res) => {
    let uid = req.query.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveProfile(uid);
    res.render("admin-delete-user", { userInfo, error: "" });
};
exports.deleteUser = async (req, res) => {
    let uid = req.body.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveProfile(uid);
    let error = "";
    try {
        await accountModel.deleteUser(uid);
        console.log("user deleted!");
        res.redirect("/admin-users");
    } catch (err) {
        console.error(err);
        error = "Error deleting user";
    }
    res.render("admin-delete-user", { userInfo, error });
};
