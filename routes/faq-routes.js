const express = require("express");
const path = require("path");
const router = express.Router();
const faqController = require('../controllers/faq-controller')

//Show all FAQs
router.get('/', faqController.listFaqs)

//Admin Dashboard Handling
router.get('/admin', faqController.adminFaqs)

//Admin Edit FAQs
router.get('/admin/edit', faqController.getFaq)

module.exports = router