const express = require('express')
const { createEmail, sendBulkEmails, addEmailConfig } = require("../controllers/emailController")
const requireAuth = require('../middlewares/requireAuth')

const router = express.Router()

router.use(requireAuth);

router.post("/create", createEmail)
router.post("/send/:mailId",sendBulkEmails)
router.post("/add-email-config", addEmailConfig) //adding new sender email and passwords

module.exports = router