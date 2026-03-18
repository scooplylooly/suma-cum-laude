const listing = require("../models/pet-model");

exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    res.render("pet-search", { pets });
};