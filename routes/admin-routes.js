const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware.js");


//First page upon login admin is verified using middleware and routed to the admin dashboard/page
router.get("/admin/admin-page", authMiddleware.isAdmin, adminController.showAdminPage);

//GET and POST for showing the listings page and filters
router.get(
    "/admin/listings",
    authMiddleware.isAdmin,
    adminController.showIncomingListings,
);
router.post(
    "/admin/listings",
    authMiddleware.isAdmin,
    adminController.filterListings,
);

//GET and POST for for admin to approve the listings status
router.get(
    "/admin/change-listings-status",
    authMiddleware.isAdmin,
    adminController.confirmListingStatus,
);
router.post(
    "/admin/change-listings-status",
    authMiddleware.isAdmin,
    adminController.updateListingStatus,
);

//CRUD routes for listers
router.get(
    "/admin/lister-status",
    authMiddleware.isAdmin,
    adminController.confirmListerStatus,
);
router.post(
    "/admin/lister-status",
    authMiddleware.isAdmin,
    adminController.updateListerStatus,
);
router.get(
    "/admin/lister",
    authMiddleware.isAdmin,
    adminController.showListerListings,
);

router.get(
    "/admin/lister-approve",
    authMiddleware.isAdmin,
    adminController.approveLister,
);

router.get(
    "/admin/lister-reject",
    authMiddleware.isAdmin,
    adminController.rejectLister,
);

router.get(
    "/admin/lister-update",
    authMiddleware.isAdmin,
    adminController.displayUpdateLister,
);
router.post(
    "/admin/lister-update",
    authMiddleware.isAdmin,
    adminController.updateLister,
);

router.get(
    "/admin/delete-lister",
    authMiddleware.isAdmin,
    adminController.adminDeleteLister,
);

//Admin routes for users CRUD
router.get("/admin/users", authMiddleware.isAdmin, adminController.showUsers)
router.post("/admin/users", authMiddleware.isAdmin, adminController.filterUsers)

//Handle GET and POST for user deletion
router.get(
    "/admin/delete-user",
    authMiddleware.isAdmin,
    adminController.displayDeleteUser,
);


router.post(
    "/admin/delete-user",
    authMiddleware.isAdmin,
    adminController.deleteUser,
);

//GET and POST Route for updating user details
router.get(
    "/admin/user-update",
    authMiddleware.isAdmin,
    adminController.displayUpdateUser,
);

router.post(
    "/admin/user-update",
    authMiddleware.isAdmin,
    adminController.updateUser,
);

//ALlows the admin to view all user applications for pets
router.get(
    "/admin/view-user-applications",
    authMiddleware.isAdmin,
    adminController.viewUserApplications,
);

module.exports = router;
