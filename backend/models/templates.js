const { mongoose } = require("mongoose");
const Users = require("./users"); 
const Schema = mongoose.Schema

const templateSchema = new Schema({
  userId : {
    type : String,
    ref : "User",
    requires : true
  },
  
  templateName : {
    type : String,
    required: true,
    trim : true
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Business', 'Personal'], // Example categories
    },

  description : {
    type : String,
    required : true
  },

  subject : {
    type : String,
    required : true,
    trim : true,
  },

  content : {
    type : String,
    required : true
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },

}, {timestamps : true})


const Templates = mongoose.model('Templates', templateSchema)


module.exports = Templates