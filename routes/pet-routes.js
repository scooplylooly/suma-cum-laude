const express = require("express");
const multer = require("multer"); //upload image stuff
const path = require("path");
const router = express.Router();
const petController = require("../controllers/pet-controller");

// dont touch-- upload image stuff
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/"); // Save to public/images
    },
    filename: function (req, file, cb) {
        // Get original extension (e.g., .jpg, .png)
        const ext = path.extname(file.originalname);
        // Create filename: pet-1234567890.jpg
        const uniqueName = "pet-" + Date.now() + ext;
        cb(null, uniqueName);
    },
});

// File filter to only allow images
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
// dont touch-- upload image stuff

router.get("/adopt", petController.displayPets);
router.post("/pet-profile", petController.showPetProfile);
router.post("/apply-for-pet", petController.applyInterest);
router.get("/create-listing", petController.showPetListingForm);
router.post(
    "/create-listing",
    upload.single("image"),
    petController.createPetListing,
);
module.exports = router;
