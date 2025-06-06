const express = require('express')
const { createEmail, sendBulkEmails } = require("../controllers/emailController")

const router = express.Router()

router.post("/create", createEmail)
router.post("/send/:mailId",sendBulkEmails)

module.exports = router