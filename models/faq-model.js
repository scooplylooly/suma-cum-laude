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
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
)

const FAQ = mongoose.model('FAQ', faqSchema, 'faq')

//Methods

exports.getAllFaqs = async () => {
  return FAQ.find().lean()
}

exports.getFaqById = async(faqId) => {
  return FAQ.findById(faqId).lean()
}

exports.updateFaq = async (faqId, newFAQ) => {
  return FAQ.findByIdAndUpdate(faqId, newFAQ, {
    returnDocument: 'after',
    runValidators: true
  });
};

exports.deleteFaq = async (faqId) => {
  return FAQ.findByIdAndDelete(faqId)
}

exports.createFaq = async (faq) => {
  try {
    FAQ.create(faq)
    console.log("FAQ created successfully!")
  } catch(error) {
    console.log(error)
  }
}

exports.countFaqs = async () => {
  try {
    return FAQ.countDocuments({})
  } catch(error) {
    return error
  }
}