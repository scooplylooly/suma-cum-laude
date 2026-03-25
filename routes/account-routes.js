const express = require("express");

const router = express.Router();
const accountController = require("../controllers/account-controller.js");
const authMiddleware = require("../middleware/auth-middleware.js")

router.get('/register', accountController.showRegister);
router.post('/register', accountController.handleRegister);

router.get('/login', authMiddleware.isLoggedIn,accountController.showLogin);
router.post('/login', accountController.handleLogin);

router.get('/profile', accountController.showProfile);

router.get('/edit-profile', accountController.updateProfile);
router.post('/edit-profile', accountController.processUpdate);

router.get('/delete-profile', accountController.deleteConfirmation);
router.post('/delete-profile', accountController.deleteProfile);

router.get('/logout', accountController.logout);

module.exports = router;