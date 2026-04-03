const mongoose = require('mongoose')

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    published: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null
    }
  },
  { timestamps: true }
)

//Declare schema to use
const FAQ = mongoose.model('FAQ', faqSchema, 'faq')

//Methods

//Fetch all FAQs filtered by published
exports.getPublishedFaqs = async () => {
  return FAQ.find({ published: true }).lean()
}

//Fetch all FAQs
exports.getAllFaqs = async () => {
  return FAQ.find().lean()
}

//Fetch the FAQ by ID
exports.getFaqById = async(faqId) => {
  return FAQ.findById(faqId).lean()
}

//Method to update the FAQ and runvalidators to make sure it is consistent with the schema before submission
exports.updateFaq = async (faqId, newFAQ) => {
  return FAQ.findByIdAndUpdate(faqId, newFAQ, {
    returnDocument: 'after',
    runValidators: true
  });
};

//Delete the FAQ by ID
exports.deleteFaq = async (faqId) => {
  return FAQ.findByIdAndDelete(faqId)
}

//Create the FAQ
exports.createFaq = async (faq) => {
  try {
    const result = await FAQ.create(faq)
    console.log("FAQ created successfully!")
    return result
  } catch(error) {
    console.log(error)
    return error
  }
}

//Count the number of FAQs for admin dashboard
exports.countFaqs = async () => {
  try {
    return FAQ.countDocuments({})
  } catch(error) {
    return error
  }
}