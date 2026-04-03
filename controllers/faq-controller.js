const FAQ = require('../models/faq-model')


// List only all the published FAQs
exports.listFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.getPublishedFaqs()
    res.render('faq/faqindex', { faqs })
  } catch (error) {
    res.send(error.message)
  }
}

//Display all the FAQs for the admin side
exports.adminFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.getAllFaqs()
    res.render('faq/adminfaqindex', { faqs })
  } catch (error) {
    res.send(error.message)
  }
}

//Handle the GET Route for editting the FAQ
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

//Handle the POST Route for editting the FAQ and log onto the database
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

//Delete the FAQ
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

//Render the page to create the FAQ
exports.showAddFaq = async (req, res) => {
  res.render('faq/createfaq', { faq: null, msg: '' })
}

//Handle the POST Route for the FAQ
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