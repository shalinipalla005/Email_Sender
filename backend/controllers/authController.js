const User = require('../models/User'); // Changed from users to User
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET_KEY, {expiresIn : '2d'});
}

//login 
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try{
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.status(200).json({userName : user.userName, email, token})
    }
    catch(error){
        res.status(400).json({error : error.message})
    }
}

//signup
const signupUser = async (req, res) => {
    const {userName, email, password} = req.body;

    try{
        const user = await User.signup(userName, email, password)
        const token = createToken(user._id);
        res.status(200).json({userName, email, token});
    }
    catch(error){
        res.status(400).json({error : error.message})
    }
}

module.exports = {signupUser, loginUser};