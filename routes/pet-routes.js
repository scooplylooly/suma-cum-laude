const express = require("express");

const router = express.Router();
const petController = require("../controllers/pet-controller");

//
router.get("/adopt", petController.displayPets);
router.post("/pet-profile", petController.showPetProfile);
router.post("/pet-profile", petController.applyInterest);
router.get("/create-listing", petController.showPetListingForm);
module.exports = router;
