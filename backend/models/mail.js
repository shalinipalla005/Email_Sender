import mongoose from 'mongoose';

const  mailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  recipientEmail: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }],
  senderEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed'],
    default: 'Pending'
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('mail', mailSchema);