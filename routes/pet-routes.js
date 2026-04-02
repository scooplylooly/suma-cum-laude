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
    authMiddleware.isLister,
    petController.showPetListingForm,
);
router.post(
    "/create-listing",
    upload.single("image"),
    authMiddleware.isLister,
    petController.createPetListing,
);
router.get("/search", authMiddleware.checkUser, petController.searchPet);
router.get(
    "/view-listings",
    authMiddleware.isLister,
    petController.viewListings,
);
router.get(
    "/edit-listing",
    authMiddleware.isLister,
    petController.showPetlistingProfile,
);

router.get(
    "/update-pet",
    authMiddleware.isLister,
    petController.updatePetProfile,
);
router.post(
    "/update-pet",
    authMiddleware.isLister,
    upload.single("image"),
    petController.petUpdated,
);
router.get(
    "/delete-pet",
    authMiddleware.isLister,
    petController.deletePetProfile,
);
router.get("/approve", authMiddleware.isLister, petController.approveApp);
router.get("/deny", authMiddleware.isLister,petController.denyApp);
router.get(
    "/application-status",
    authMiddleware.checkUser,
    petController.applicationStatus,
);
router.post("/delete-pet", authMiddleware.isLister, petController.petDeleted);
router.get("/view-applications",authMiddleware.isLister, petController.viewApplications);
router.get("/deleteApplication", authMiddleware.checkUser, petController.deleteApplication);
router.get("/updateApplication", authMiddleware.checkUser, petController.updateApplication);
router.post("/update-application", authMiddleware.checkUser, petController.updateApplicationDetails);
module.exports = router;
