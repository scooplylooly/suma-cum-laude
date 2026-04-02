const express = require("express");
const path = require("path");
const router = express.Router();
const faqController = require('../controllers/faq-controller')
const authMiddleware = require("../middleware/auth-middleware.js");

//Show all FAQs
router.get('/faq', faqController.listFaqs)

//Admin Dashboard Handling
router.get('/admin/faq', authMiddleware.isAdmin, faqController.adminFaqs)

//Admin Edit FAQs
router.get('/admin/faq/edit', authMiddleware.isAdmin, faqController.getFaq)
router.post('/admin/faq/edit', authMiddleware.isAdmin, faqController.editFaqs)

router.post('/admin/faq/delete', authMiddleware.isAdmin, faqController.deleteFaq)

router.get('/admin/faq/new', authMiddleware.isAdmin, faqController.showAddFaq)
router.post('/admin/faq/new', authMiddleware.isAdmin, faqController.newFaq)

module.exports = router