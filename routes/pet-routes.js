const express = require("express");

const router = express.Router();
const petController = require("../controllers/pet-controller");

//
router.get("/adopt-now", petController.displayPets);

module.exports = router;
