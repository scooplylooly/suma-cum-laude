const express = require("express");
const path = require("path");
const router = express.Router();
const faqController = require('../controllers/faq-controller')


router.get('/', faqController.listFaqs)
router.get('/admin', faqController.adminFaqs)



module.exports = router