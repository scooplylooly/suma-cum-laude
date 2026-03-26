const FAQ = require('../models/faq-model')


exports.listFaqs = async (req, res) => {
    let faqs = await FAQ.getAllFaqs()
    console.log(faqs)
    res.render('faq/faqindex', {faqs})
}

exports.adminFaqs = async (req, res) => {
    let faqs = await FAQ.getAllFaqs()
    console.log(faqs)
    res.render('faq/adminfaqindex', {faqs})
}

exports.editFaqs = async (req, res) => {
    try {
        let faqID = req.params.id
        let faq = await FAQ.getFaqById(faqID)
        if (!faq) {
        return res.status(404).send('FAQ not found')
        }
        res.render('faq/faqedit', {faq})
    } catch(error) {
        res.send(error)
    }
}