import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  templates: [{ type: mongoose.Schema.Types.ObjectId, ref: "template" }],
  mails: [{ type: mongoose.Schema.Types.ObjectId, ref: "mail" }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('user', userSchema);