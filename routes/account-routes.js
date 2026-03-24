const express = require("express");

const router = express.Router();
const accountController = require("../controllers/account-controller.js");
const authMiddleware = require("../middleware/auth-middleware.js")

router.get('/register', accountController.showRegister);
router.post('/register', accountController.handleRegister);
router.get('/login', accountController.showLogin);
router.post('/login', accountController.handleLogin);
router.get('/profile', authMiddleware.isAdmin)

module.exports = router;