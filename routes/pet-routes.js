const express = require("express");

const router = express.Router();
const petController = require("../controllers/pet-controller");

//
router.get("/AdoptNow", petController.displayPets);
router.post("/AdoptNow", petController.showPetProfile);
router.get("/create-listing", petController.showPetListingForm);
module.exports = router;
