const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const validator = require("validator")


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
});

//signup function

userSchema.statics.signup = async function(userName, email, password){
  if(!userName || !email || !password){
    throw Error("All fields must be filled")
  }

  if(!validator.isEmail(email)){
    throw Error("Email not valid")
  }

  if(!validator.isStrongPassword(password)){
    throw Error("Password not strong enough")
  }
  const userExists = await this.findOne({userName})

  if(userExists){
    throw Error("User already exists")
  }

  const exists = await this.findOne({email})

  if(exists){
    throw Error("Email already in use")
  }

  const salt = await bcrypt.genSalt(10)

  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({userName, email, password : hash})

  return user

}

// login function

userSchema.statics.login = async function(email, password){
  if(!email || !password){
    throw Error("All fields are required")
  }

  const user = await this.findOne({email})

  if(!user){
    throw Error("Incorrect Email")
  }

  const match  = await bcrypt.compare(password, user.password)

  if(!match){
    throw Error("Incorrect Password")
  }

  return user
  
}

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
