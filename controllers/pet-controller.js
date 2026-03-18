const listing = require("../models/pet-model");

exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    console.log(pets);

    pets.reverse();
    res.render("pet-search", {
        pets,
    });
};
exports.showPetProfile = async (req, res) => {
    let pets = await listing.getAllPets();
    console.log(pets);
    let name = req.body.petName;
    let petFound;
    for (pet of pets) {
        if (pet.Name == name) {
            petFound = pet;
        }
    }
    res.render("pet-profile", {
        petFound,
        errorMsg: "",
        successMsg: "",
    });
};

exports.showPetListingForm = async (req, res) => {
    res.render("pet-create-listing", {
        errorMsg: "",
        successMsg: "",
    });
};

exports.applyInterest = async (req, res) => {
    let errorMsg = "";
    let successMsg = "";
    let petFound = null;

    let petName = req.body.petName;
    let pets = await listing.getAllPets();
    for (let pet of pets) {
        if (pet.Name == petName) {
            petFound = pet;
            break;
        }
    }

    let application = {
        uid: null,
        pid: null,
        reason: req.body.applyReason,
    };
    try {
        await listing.writeApplyInfo(application);
        successMsg += "Application successful!";
    } catch (error) {
        errorMsg += "Application failed.";
        console.error("Error when applying", error);
    }

    res.render("pet-profile", {
        petFound: petFound,
        errorMsg: errorMsg,
        successMsg: successMsg,
    });
};
