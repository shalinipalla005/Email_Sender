const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Business', 'Personal']
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', templateSchema); 