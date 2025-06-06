const express = require('express');
const router = express.Router();
const {signupUser , loginUser } = require('../controllers/authController');


router.post('/register', signupUser);
router.post('/login', loginUser);

module.exports = router;