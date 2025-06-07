const  mongoose  = require("mongoose");

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
    },
    dynamicFields:{
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    }

  }],

  availableVariables: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean'],
      default: 'string'
    }
  }],

  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: true 
  },

}, { timestamps: true });

const Mails = mongoose.model("Mails", mailSchema);
module.exports = Mails; 
