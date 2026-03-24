const express = require("express");

const router = express.Router();
const authController = require("../controllers/index-controller.js");

router.get('/sign-up', authController.showRegister);
router.post('/sign-up', authController.handleRegister);
router.get('/sign-in', authController.showLogin);
router.post('/sign-in', authController.handleLogin);
router.get('/apply-lister', authController.showLister)
router.post('/apply-lister', authController.handleLister)


module.exports = router;