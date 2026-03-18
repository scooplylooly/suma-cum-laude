const express = require("express");

const router = express.Router();
const petController = require("../controllers/pet-controller");

//
router.get("/adopt-now", petController.displayPets);
router.post("/adopt-now", petController.showPetProfile);
router.get("/create-listing", petController.showPetListingForm);
module.exports = router;
