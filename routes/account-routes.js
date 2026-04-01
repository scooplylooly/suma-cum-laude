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

router.get("/delete-profile", authMiddleware.checkUser, accountController.deleteConfirmation1);
router.post("/delete-profile", authMiddleware.checkUser, accountController.deleteProfile);
// Lister routes
router.get('/apply-lister', authMiddleware.checkUser, accountController.showLister)
router.post('/apply-lister', authMiddleware.checkUser, accountController.handleLister)

router.get("/lister-application-status", authMiddleware.checkUser, accountController.showListerStatus)

router.get("/update-lister-profile", authMiddleware.checkUser, accountController.updateLister);
router.post("/update-lister-profile", authMiddleware.checkUser, accountController.processLister);

router.get("/delete-lister-profile", authMiddleware.checkUser, accountController.deleteConfirmationForLister);
router.post("/delete-lister-profile", authMiddleware.checkUser, accountController.deleteLister);

router.get("/preferences", authMiddleware.checkUser, accountController.userPreferenceForm);
router.post("/preferences", authMiddleware.checkUser, accountController.updatePreferences);

router.get("/logout", authMiddleware.checkUser, accountController.logout);

module.exports = router;