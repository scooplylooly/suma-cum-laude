const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");

router.get("/admin-page", adminController.showAdminPage);
router.get("/admin-listings", adminController.showIncomingListings);
router.post("/admin-listings", adminController.filterListings);
router.get(
    "/admin-change-listings-status",
    adminController.confirmListingStatus,
);
router.post(
    "/admin-change-listings-status",
    adminController.updateListingStatus,
);
module.exports = router;
