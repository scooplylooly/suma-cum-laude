const FAQ = require('../models/faq-model')

exports.listFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.getAllFaqs()
    res.render('faq/faqindex', { faqs })
  } catch (error) {
    res.send(error.message)
  }
}

exports.adminFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.getAllFaqs()
    res.render('faq/adminfaqindex', { faqs })
  } catch (error) {
    res.send(error.message)
  }
}

exports.getFaq = async (req, res) => {
  try {
    const faqID = req.query.id
    const faq = await FAQ.getFaqById(faqID)

    if (!faq) {
      return res.send('FAQ not found')
    }

    res.render('faq/faqedit', { faq })
  } catch (error) {
    res.send(error.message)
  }
}

exports.editFaqs = async (req, res) => {
  try {
    const {
      id: faqID,
      question,
      answer,
      category,
      published
    } = req.body

    const newFaq = {
      question,
      answer,
      category,
      published: published === 'true'
    }

    const updated = await FAQ.updateFaq(faqID, newFaq)

    if (!updated) {
      return res.send('FAQ not found')
    }

    return res.redirect('/admin/faq')
  } catch (error) {
    res.send(error.message)
  }
}

exports.deleteFaq = async (req, res) => {
  const faqID = req.body.id

  if (!faqID) {
    return res.send('No such FAQ found!')
  }

  try {
    const deletedFaq = await FAQ.deleteFaq(faqID)

    if (!deletedFaq) {
      return res.send('FAQ not found')
    }

    console.log('FAQ successfully deleted.')
    return res.redirect('/admin/faq')
  } catch (error) {
    return res.send(error.message)
  }
}

exports.showAddFaq = async (req, res) => {
  res.render('faq/createfaq', { faq: null, msg: '' })
}

exports.newFaq = async (req, res) => {
  const user = req.session.user

  const {
    question,
    answer,
    category,
    published
  } = req.body

  if (!question || !answer || !category || published === undefined) {
    const msg = 'Please enter all fields'
    return res.render('faq/createfaq', { faq: null, msg })
  }

  try {
    const addFaq = {
      question,
      answer,
      category,
      published: published === 'true',
      createdBy: user ? user._id : null
    }

    const result = await FAQ.createFaq(addFaq)
    console.log(result)
    return res.redirect('/admin/faq')
  } catch (error) {
    return res.send(error.message)
  }
}