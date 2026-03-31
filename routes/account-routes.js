const express = require("express");

const router = express.Router();
const accountController = require("../controllers/account-controller.js");
const authMiddleware = require("../middleware/auth-middleware.js");

router.get("/register", accountController.showRegister);
router.post("/register", accountController.handleRegister);

router.get("/login", accountController.showLogin);
router.post("/login", accountController.handleLogin);

router.get("/forget-password", accountController.showVerify);
router.post("/forget-password", accountController.handleVerify);
router.get("/reset-password", authMiddleware.verifiedIdentity, accountController.showResetPassword);
router.post("/reset-password", authMiddleware.verifiedIdentity, accountController.handleResetPassword);

router.get("/profile", authMiddleware.checkUser, accountController.showProfile);
router.get("/edit-profile", authMiddleware.checkUser, accountController.updateProfile);
router.post("/edit-profile", authMiddleware.checkUser, accountController.processUpdate);

router.get("/delete-profile", authMiddleware.checkUser, accountController.deleteConfirmation);
router.post("/delete-profile", authMiddleware.checkUser, accountController.deleteProfile);

router.get("/logout", authMiddleware.checkUser, accountController.logout);

module.exports = router;