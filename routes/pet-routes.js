const express = require("express");

const router = express.Router();
const petController = require("../controllers/pet-controller");

//
<<<<<<< HEAD
router.get("/adoptNow", petController.displayPets);
router.post("/pet-profile", petController.showPetProfile);
router.post("/pet-profile", petController.applyInterest);
=======
router.get("/adopt-now", petController.displayPets);
router.post("/adopt-now", petController.showPetProfile);
>>>>>>> main
router.get("/create-listing", petController.showPetListingForm);
module.exports = router;
