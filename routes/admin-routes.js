const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware.js");

router.get("/admin/admin-page", adminController.showAdminPage);
router.get(
    "/admin/listings",
    authMiddleware.isAdmin,
    adminController.showIncomingListings,
);
router.post("/admin/listings", adminController.filterListings);
router.get(
    "/admin/change-listings-status",
    authMiddleware.isAdmin,
    adminController.confirmListingStatus,
);
router.post(
    "/admin/admin-change-listings-status",
    authMiddleware.isAdmin,
    adminController.updateListingStatus,
);
router.get("/admin/users", authMiddleware.isAdmin, adminController.showUsers);
router.post("/admin/users", adminController.filterUsers);

router.get(
    "/admin/delete-user",
    authMiddleware.isAdmin,
    adminController.displayDeleteUser,
);
router.post("/admin/delete-user", adminController.deleteUser);
router.get(
    "/admin/user-update",
    authMiddleware.isAdmin,
    adminController.displayUpdateUser,
);
router.post("/admin/admin-user-update", adminController.updateUser);
router.get(
    "/admin/view-user-applications",
    authMiddleware.isAdmin,
    adminController.viewUserApplications,
);

router.get("/admin/dashboard", adminController.showAdminDashboard);
module.exports = router;
