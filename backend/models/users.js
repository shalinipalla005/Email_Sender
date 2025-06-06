const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
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
  }
}, { timestamps: true });

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
