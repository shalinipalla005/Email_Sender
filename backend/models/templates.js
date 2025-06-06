const { mongoose } = require("mongoose")
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
  }

}, {timestamps : true})


const Templates = mongoose.model('Templates', templateSchema)


module.exports = Templates