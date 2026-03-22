const express = require("express");

const router = express.Router();
const authController = require("../controllers/index-controller.js");

router.get('/sign-up', authController.showRegister);
router.post('/sign-up', authController.handleRegister);
router.get('/sign-in', authController.showLogin);
router.post('/sign-in', authController.handleLogin);

module.exports = router;