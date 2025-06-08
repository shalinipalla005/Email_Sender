const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  fields: [{
    type: String,
    required: true
  }],
  rowCount: {
    type: Number,
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
  lastUsed: {
    type: Date
  },
  useCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Data', dataSchema); 