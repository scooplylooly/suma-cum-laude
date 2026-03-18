const listing = require("../models/pet-model");

exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    pets.reverse();
    res.render("pet-search", {
        pets,
    });
};
exports.showPetProfile = async (req, res) => {
    let pets = await listing.getAllPets();
    let name = req.body.petName;
    let petFound;
    for (pet of pets) {
        if (pet.Name == name) {
            petFound = pet;
            console.log(petFound);
        }
    }
    res.render("pet-profile", {
        petFound,
    });
};

exports.showPetListingForm = async (req, res) => {
    res.render("pet-create-listing", {
        errorMsg: "",
        successMsg: "",
    });
};
