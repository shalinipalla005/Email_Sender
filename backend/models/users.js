const { mongoose } = require("mongoose")

const Schema = mongoose.Schema


const userSchema = new Schema({

  userName : {
    type : String,
    required : true,
    trim : true
  },

  email : {
    type : String,
    required : true,
    unique : true,
  },
  
  password : {
    type : String,
    required : true
  },

  templates : [{
    type : Schema.Types.ObjectId,
    ref : "Template",
  }],

  mails : [{type : Schema.Types.ObjectId, ref : "Mails"}]
}, {})


const Users = mongoose.model("Users", userSchema)

module.exports = Users