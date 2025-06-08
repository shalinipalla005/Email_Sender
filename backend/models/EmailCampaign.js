const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  recipientName: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  personalizedSubject: {
    type: String,
    required: true
  },
  personalizedBody: {
    type: String,
    required: true
  },
  customFields: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  error: String
});

const emailCampaignSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientData: [recipientSchema],
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'failed'],
    default: 'draft'
  },
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
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
emailCampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema); 