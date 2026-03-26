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

exports.getFaq = async (req, res) => {
    let faqID = req.query.id
    let faq = await FAQ.getFaqById(faqID)
    res.render('faq/faqedit', { faq })
}

exports.editFaqs = async (req, res) => {
    try {
        const { id: faqID, question: newQuestion, answer: newAnswer, category: newCategory, published } = req.body
        const newFaq = { 
            question: newQuestion,
            answer: newAnswer,
            category: newCategory,
            published: published 
         }
        const updated = await FAQ.updateFaq(faqID, newFaq)
        
        if (!updated) {
        return res.send('FAQ not found')
        }
        const faqs = await FAQ.getAllFaqs()
        res.render('faq/adminfaqindex', {faqs})
        } catch(error) {
            res.send(error)
        }
}