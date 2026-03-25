const FAQ = require('../models/faq-model')


exports.listFaqs = async (req, res) => {
    let faqs = await FAQ.getAllFaqs()
    console.log(faqs)
    res.render('faq/faqindex', {faqs})
}