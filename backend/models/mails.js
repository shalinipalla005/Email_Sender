import mongoose from 'mongoose';

const mailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },

  body: {
    type: String,
    required: true 
  },

  senderEmail: {
    type: String,
    required : true,
    trim : true,
    lowercase : true
  },

  recipientData: [{
    recipientName: {
      type: String,
      required: true
    },

    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }

  }],

  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: true 
  },

}, { timestamps: true });

const Mails = mongoose.model("Mails", mailSchema);
module.export = Mails; 
