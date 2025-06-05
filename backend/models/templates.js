import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["General", "Personal", "Professional"]
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('templates', templateSchema);