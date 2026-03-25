const express = require("express");
const multer = require("multer"); //upload image stuff
const path = require("path");
const router = express.Router();
const petController = require("../controllers/pet-controller");
const authMiddleware = require("../middleware/auth-middleware.js");

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

router.get("/adopt", authMiddleware.checkUser, petController.displayPets);
router.get(
    "/pet-profile",
    authMiddleware.checkUser,
    petController.showPetProfile,
);
router.post(
    "/apply-for-pet",
    authMiddleware.checkUser,
    petController.applyInterest,
);
router.get(
    "/create-listing",
    authMiddleware.checkUser,
    petController.showPetListingForm,
);
router.post(
    "/create-listing",
    upload.single("image"),
    authMiddleware.checkUser,
    petController.createPetListing,
);
router.get("/search", authMiddleware.checkUser, petController.searchPet);
router.get(
    "/view-listings",
    authMiddleware.checkUser,
    petController.viewListings,
);
router.get(
    "/edit-listing",
    authMiddleware.checkUser,
    petController.showPetlistingProfile,
);

router.get(
    "/update-pet",
    authMiddleware.checkUser,
    petController.updatePetProfile,
);
router.post(
    "/update-pet",
    authMiddleware.checkUser,
    upload.single("image"),
    petController.petUpdated,
);
router.get(
    "/delete-pet",
    authMiddleware.checkUser,
    petController.deletePetProfile,
);
router.post("/delete-pet", authMiddleware.checkUser, petController.petDeleted);
router.get('/view-applications', petController.viewApplications)
module.exports = router;
