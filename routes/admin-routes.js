const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware.js");

router.get("/admin-page", adminController.showAdminPage);
router.get(
    "/admin-listings",
    authMiddleware.isAdmin,
    adminController.showIncomingListings,
);
router.post("/admin-listings", adminController.filterListings);
router.get(
    "/admin-change-listings-status",
    authMiddleware.isAdmin,
    adminController.confirmListingStatus,
);
router.post(
    "/admin-change-listings-status",
    authMiddleware.isAdmin,
    adminController.updateListingStatus,
);
router.get("/admin-users", authMiddleware.isAdmin, adminController.showUsers);
router.post("/admin-users", adminController.filterUsers);

router.get(
    "/delete-user-profile",
    authMiddleware.isAdmin,
    adminController.displayDeleteUser,
);
router.post("/delete-user-profile", adminController.deleteUser);
router.get(
    "/admin-user-update",
    authMiddleware.isAdmin,
    adminController.displayUpdateUser,
);
router.post("/admin-user-update", adminController.updateUser);

router.get(
    "/admin-listings",
    authMiddleware.isAdmin,
    adminController.showListerListings,
);
router.post("/admin-listings", adminController.filterListings);
router.get(
    "/admin-lister-status",
    authMiddleware.isAdmin,
    adminController.confirmListerStatus,
);
router.post(
    "/admin-lister-status",
    authMiddleware.isAdmin,
    adminController.updateListerStatus,
);
router.get("/admin-lister", authMiddleware.isAdmin, adminController.showLister);
router.post("/admin-lister", adminController.filterLister);

router.get(
    "/delete-lister-profile",
    authMiddleware.isAdmin,
    adminController.displayDeleteLister,
);
router.post("/delete-lister-profile", adminController.deleteLister2);
router.get(
    "/admin-lister-update",
    authMiddleware.isAdmin,
    adminController.displayUpdateLister,
);
router.post("/admin-lister-update", adminController.updateLister);


module.exports = router;
