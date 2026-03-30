const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware.js");

// router.get("/admin-page", adminController.showAdminPage);
router.get(
    "/admin/listings",
    authMiddleware.isAdmin,
    adminController.showIncomingListings,
);
router.post("/admin/listings", adminController.filterListings);
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
router.get("/admin/users", authMiddleware.isAdmin, adminController.showUsers);
router.post("/admin/users", adminController.filterUsers);

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
    "/view-user-applications",
    authMiddleware.isAdmin,
    adminController.viewUserApplications,
);
router.get("/admin/dashboard", authMiddleware.isAdmin, adminController.showAdminDashboard);
module.exports = router;
