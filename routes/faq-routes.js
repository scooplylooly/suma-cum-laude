const express = require("express");
const path = require("path");
const router = express.Router();
const faqController = require('../controllers/faq-controller')

//Show all FAQs
router.get('/faq', faqController.listFaqs)

//Admin Dashboard Handling
router.get('/admin/faq', faqController.adminFaqs)

//Admin Edit FAQs
router.get('/admin/faq/edit', faqController.getFaq)
router.post('/admin/faq/edit', faqController.editFaqs)

router.post('/admin/faq/delete', faqController.deleteFaq)

router.get('/admin/faq/new', faqController.showAddFaq)
router.post('/admin/faq/new', faqController.newFaq)

module.exports = router