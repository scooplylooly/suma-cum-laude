const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controllers/admin-controller");

router.get("/admin-page", adminController.showAdminPage);
module.exports = router;
