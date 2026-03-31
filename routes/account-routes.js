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

router.get('/apply-lister', authMiddleware.checkUser, accountController.showLister)
router.post('/apply-lister', authMiddleware.checkUser, accountController.handleLister)

router.get("/lister-application-status", authMiddleware.checkUser, accountController.showListerStatus)

router.get("/edit-lister", authMiddleware.checkUser, accountController.updateLister);
router.post("/edit-lister", authMiddleware.checkUser, accountController.processLister);

router.get("/delete-lister", authMiddleware.checkUser, accountController.deleteConfirmation2);
router.post("/delete-lister", authMiddleware.checkUser, accountController.deleteLister);

router.get("/logout", accountController.logout);

module.exports = router;