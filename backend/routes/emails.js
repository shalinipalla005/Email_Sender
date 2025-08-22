const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const {
    createEmail,
    sendBulkEmails,
    addEmailConfig,
    deleteEmailConfig,
    getSentEmails,
    getEmailStats
} = require('../controllers/emailController');
const User = require('../models/User');

// Get email configurations
router.get('/configs', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const configs = user.emailConfigs.map(config => ({
            senderEmail: config.senderEmail
        }));
        res.json(configs);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add email configuration
router.post('/add-email-config', auth, [
    body('senderEmail').isEmail().withMessage('Valid sender email is required'),
    body('appPassword').notEmpty().withMessage('App password is required')
], addEmailConfig);

// Create email campaign
router.post('/create', auth, [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('body').notEmpty().withMessage('Email body is required'),
    body('senderEmail').isEmail().withMessage('Valid sender email is required'),
    body('recipientData').isArray().withMessage('Recipient data must be an array')
], createEmail);

// Send email campaign
router.post('/send/:mailId', auth, sendBulkEmails);

// Get sent emails
router.get('/sent', auth, getSentEmails);

// Get email stats
router.get('/stats', auth, getEmailStats);

// Delete email configuration
router.post('/delete-email-config', auth, [
    body('senderEmail').isEmail().withMessage('Valid sender email is required')
], deleteEmailConfig);

module.exports = router; 
