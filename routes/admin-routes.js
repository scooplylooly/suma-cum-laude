const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware.js");

router.get(
    "/admin-page",
    authMiddleware.isAdmin,
    adminController.showAdminPage,
);
router.get(
    "/admin-listings",
    authMiddleware.checkUser,
    adminController.showIncomingListings,
);
router.post(
    "/admin-listings",
    authMiddleware.checkUser,
    adminController.filterListings,
);
router.get(
    "/admin-change-listings-status",
    authMiddleware.checkUser,
    adminController.confirmListingStatus,
);
router.post(
    "/admin-change-listings-status",
    authMiddleware.checkUser,
    adminController.updateListingStatus,
);
router.get("/admin-users", authMiddleware.checkUser, adminController.showUsers);
router.post(
    "/admin-users",
    authMiddleware.checkUser,
    adminController.filterUsers,
);

router.get(
    "/delete-user-profile",
    authMiddleware.isAdmin,
    adminController.displayDeleteUser,
);
router.post(
    "/delete-user-profile",
    authMiddleware.isAdmin,
    adminController.deleteUser,
);
module.exports = router;
