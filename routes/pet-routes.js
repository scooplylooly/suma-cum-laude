const express = require("express");
const multer = require("multer"); //upload image stuff
const path = require("path");
const router = express.Router();
const petController = require("../controllers/pet-controller");

// dont touch-- upload image stuff
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = "pet-" + Date.now() + ext;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
// dont touch-- upload image stuff

router.get("/adopt", petController.displayPets);
router.get("/pet-profile", petController.showPetProfile);
router.post("/apply-for-pet", petController.applyInterest);
router.get("/create-listing", petController.showPetListingForm);
router.post(
    "/create-listing",
    upload.single("image"),
    petController.createPetListing,
);
router.get("/search", petController.searchPet);
router.get("/view-listings", petController.viewListings);
router.get("/edit-listing", petController.showPetlistingProfile);

router.get("/update-pet", petController.updatePetProfile);
router.post("/update-pet", upload.single("image"), petController.petUpdated);
router.get("/delete-pet", petController.deletePetProfile);
router.post("/delete-pet", petController.petDeleted);
module.exports = router;