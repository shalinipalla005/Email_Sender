const { mongoose } = require("mongoose")
const Schema = mongoose.Schema

const templateSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  templateName: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true,
    enum: ['General', 'Business', 'Personal'],
    default: 'General'
  },

  subject: {
    type: String,
    required: true,
    trim: true
  },

  content: {
    type: String,
    required: true
  },

  useCount: {
    type: Number,
    default: 0
  },

  lastUsed: {
    type: Date
  }

}, {timestamps: true})

const Templates = mongoose.model('Templates', templateSchema)

module.exports = Templates