const express = require("express");

const router = express.Router();
const petController = require("../controllers/pet-controller");

//
router.get("/AdoptNow", petController.displayPets);

module.exports = router;
