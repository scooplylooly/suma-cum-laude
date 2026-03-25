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
    const user = req.session.user;
    const pets = (await petModel.getAllPets()).reverse();
    let selectedStatus = "";
    res.render("admin-listings", { user, pets, selectedStatus });
};

exports.filterListings = async (req, res) => {
    const user = req.session.user;
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
        user,
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
