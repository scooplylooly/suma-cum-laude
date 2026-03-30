const express = require("express");

const router = express.Router();
const accountController = require("../controllers/account-controller.js");
const authMiddleware = require("../middleware/auth-middleware.js");

router.get("/register", accountController.showRegister);
router.post("/register", accountController.handleRegister);

router.get("/login", authMiddleware.isLoggedIn, accountController.showLogin);
router.post("/login", authMiddleware.isLoggedIn, accountController.handleLogin);

router.get("/forget-password", accountController.showReset);
router.post("/forget-password", accountController.handleReset);
router.get("/verify-otp", accountController.showVerifyOtp);
router.post("/verify-otp", accountController.handleVerifyOtp);
router.get("/new-password", accountController.showNewPassword);
router.post("/new-password", accountController.handleNewPassword);


router.get("/profile", authMiddleware.checkUser, accountController.showProfile);

router.get("/edit-profile", authMiddleware.checkUser, accountController.updateProfile);
router.post("/edit-profile", authMiddleware.checkUser, accountController.processUpdate);

router.get("/delete-profile", authMiddleware.checkUser, accountController.deleteConfirmation);
router.post("/delete-profile", authMiddleware.checkUser, accountController.deleteProfile);

router.get('/apply-lister', accountController.showLister)
router.post('/apply-lister', accountController.handleLister)

router.get("/login-lister", authMiddleware.isLoggedIn, accountController.showLoginL);
router.post("/login-lister", accountController.handleLoginL);

router.get("/edit-lister", accountController.updateLister);
router.post("/edit-lister", accountController.processLister);

router.get("/delete-lister", accountController.deleteConfirmation2)
router.post("/delete-lister", accountController.deleteLister)

router.get("/logout", accountController.logout);

module.exports = router;