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
router.post("/admin-user-update", adminController.updateUser);

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
router.get("/admin-lister", authMiddleware.isAdmin, adminController.showListerListings);
// router.post("/admin-lister", adminController.filterLister);

router.get(
    "/admin-lister-approve",
    authMiddleware.isAdmin,
    adminController.approveLister,
);

router.get(
    "/admin-lister-reject",
    authMiddleware.isAdmin,
    adminController.rejectLister,
);

router.get(
    "/admin-lister-update",
    authMiddleware.isAdmin,
    adminController.displayUpdateLister,
);
router.post("/admin-lister-update", adminController.updateLister);

router.get(
    "/delete-lister-profile",
    authMiddleware.isAdmin,
    adminController.displayDeleteLister,
);
router.post("/delete-lister-profile", adminController.deleteLister);
 
router.post("/admin/admin-user-update", adminController.updateUser);
router.get(
    "/admin/view-user-applications",
    authMiddleware.isAdmin,
    adminController.viewUserApplications,
);
router.get("/admin/dashboard", authMiddleware.isAdmin, adminController.showAdminDashboard);
module.exports = router;


