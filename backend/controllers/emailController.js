const nodemailer = require("nodemailer")
const User = require("../models/User")
const EmailCampaign = require('../models/EmailCampaign')
const { convert } = require('html-to-text')
const protection = require("../utils/encryptionUtils")

const createTransporter = (email, password) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: email,
            pass: password,
        },
    })
    return transporter
}

const createEmail = async (req, res) => {
    const { subject, body, recipientData, senderEmail } = req.body

    if (!subject || !body || !recipientData || !senderEmail) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        })
    }
    
    try {
        const campaign = new EmailCampaign({
            senderId: req.user._id,
            senderEmail,
            recipientData,
            subject,
            body,
            stats: {
                total: recipientData.length,
                sent: 0,
                failed: 0
            }
        })

        await campaign.save()

        res.status(201).json({
            success: true,
            message: 'Email campaign created successfully',
            mailId: campaign._id,
            data: campaign,
        })
    } catch (error) {
        console.log("Error in creating the email campaign", error)
        res.status(500).json({
            success: false,
            message: "Failed to create email campaign",
            error: error.message,
        })
    }
}

const sendBulkEmails = async (req, res) => {
    try {
        const { mailId } = req.params

        const campaign = await EmailCampaign.findOne({ _id: mailId })

        if (!campaign) {
            return res.status(400).json({
                success: false,
                message: "Email campaign not found",
            })
        }

        const user = await User.findById(campaign.senderId)

        if (!user || !user.emailConfigs || user.emailConfigs.length === 0) {
            throw Error('No sender email configured for the user')
        }

        const selectedConfig = user.emailConfigs.find(config => config.senderEmail === campaign.senderEmail)

        if (!selectedConfig) {
            throw Error('Sender email not found')
        }

        const decryptedAppPassword = protection.decrypt(selectedConfig.encryptedAppPassword)
        const transporter = createTransporter(campaign.senderEmail, decryptedAppPassword)

        campaign.status = 'processing'
        await campaign.save()

        const emailPromises = campaign.recipientData.map(async (recipient) => {
            const { recipientName, recipientEmail, customFields } = recipient

            let populatedBody = campaign.body
                .replace(/{{name}}/g, recipientName)
                .replace(/{{email}}/g, recipientEmail)

            // Replace custom fields
            if (customFields) {
                for (const [key, value] of Object.entries(customFields)) {
                    populatedBody = populatedBody.replace(new RegExp(`{{${key}}}`, 'g'), value)
                }
            }

            const mailOptions = {
                from: `${user.userName} <${campaign.senderEmail}>`,
                to: recipientEmail,
                subject: campaign.subject,
                html: populatedBody,
                text: convert(populatedBody),
            }

            try {
                await transporter.sendMail(mailOptions)
                recipient.status = 'sent'
                campaign.stats.sent++
                return {
                    recipientEmail,
                    status: 'sent',
                }
            } catch (error) {
                console.log(`Failed to send email to ${recipientEmail}:`, error)
                recipient.status = 'failed'
                recipient.error = error.message
                campaign.stats.failed++
                return {
                    recipientEmail, 
                    status: 'failed',
                    error: error.message
                }
            }
        })

        const results = await Promise.allSettled(emailPromises)
        
        campaign.status = campaign.stats.failed === 0 ? 'completed' : 'failed'
        await campaign.save()

        res.status(200).json({
            success: true,
            message: `Email campaign completed. ${campaign.stats.sent} sent, ${campaign.stats.failed} failed`
        })
    } catch (error) {
        console.log('Error in sending bulk emails', error)
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk emails',
            error: error.message
        })
    }
}

const addEmailConfig = async (req, res) => {
    try {
        const { senderEmail, appPassword } = req.body

        if (!senderEmail || !appPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and app password are required"
            })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Test the email configuration before saving
        try {
            const transporter = createTransporter(senderEmail, appPassword)
            await transporter.verify()
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email credentials. Please check your email and app password.'
            })
        }

        const encrypted = protection.encrypt(appPassword)

        // Check if email already exists
        const existingConfig = user.emailConfigs.find(config => config.senderEmail === senderEmail)
        if (existingConfig) {
            existingConfig.encryptedAppPassword = encrypted
        } else {
            user.emailConfigs.push({
                senderEmail,
                encryptedAppPassword: encrypted
            })
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: "Email configuration added successfully",
            emailConfigAdded: senderEmail
        })
    } catch (error) {
        console.log("Add email config error: ", error)
        res.status(500).json({
            success: false,
            message: 'Failed to add email config',
            error: error.message
        })
    }
}

const getSentEmails = async (req, res) => {
    try {
        const campaigns = await EmailCampaign.find({ 
            senderId: req.user._id,
            status: { $in: ['completed', 'failed'] }
        }).sort({ createdAt: -1 })

        const sentEmails = campaigns.map(campaign => ({
            _id: campaign._id,
            subject: campaign.subject,
            recipientCount: campaign.recipientData.length,
            status: campaign.status,
            createdAt: campaign.createdAt,
            stats: campaign.stats
        }))

        res.status(200).json(sentEmails)
    } catch (error) {
        console.log("Error fetching sent emails:", error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sent emails',
            error: error.message
        })
    }
}

const getEmailStats = async (req, res) => {
    try {
        const campaigns = await EmailCampaign.find({ senderId: req.user._id })
        
        const stats = {
            total: campaigns.length,
            completed: campaigns.filter(c => c.status === 'completed').length,
            failed: campaigns.filter(c => c.status === 'failed').length,
            processing: campaigns.filter(c => c.status === 'processing').length,
            totalRecipients: campaigns.reduce((acc, c) => acc + c.recipientData.length, 0),
            totalSent: campaigns.reduce((acc, c) => acc + c.stats.sent, 0),
            totalFailed: campaigns.reduce((acc, c) => acc + c.stats.failed, 0)
        }

        res.status(200).json({
            success: true,
            stats
        })
    } catch (error) {
        console.log("Error fetching email stats:", error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email stats',
            error: error.message
        })
    }
}

module.exports = {
    createEmail,
    sendBulkEmails,
    addEmailConfig,
    getSentEmails,
    getEmailStats
}