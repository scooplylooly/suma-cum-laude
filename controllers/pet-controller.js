const listing = require("../models/pet-model");

exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    console.log(pets);
    res.render("pet-search", {
        pets,
    });
};
