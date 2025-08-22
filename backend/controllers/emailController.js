const nodemailer = require("nodemailer")
const User = require("../models/User") // Make sure you're using the correct User model
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

// GET EMAIL CONFIGURATIONS - Add this function
const getEmailConfigs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Return email configurations without passwords (for security)
        const emailConfigs = user.emailConfigs.map(config => ({
            senderEmail: config.senderEmail,
            _id: config._id
        }))

        res.status(200).json({
            success: true,
            data: emailConfigs
        })
    } catch (error) {
        console.error("Error fetching email configs:", error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email configurations',
            error: error.message
        })
    }
}

const createEmail = async (req, res) => {
    const { subject, body, recipientData, senderEmail } = req.body

    if (!subject || !body || !recipientData || !senderEmail) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        })
    }

    // Validate recipient data structure
    const invalidRecipients = recipientData.filter(recipient => 
        !recipient.recipientEmail || 
        !recipient.recipientName || 
        !recipient.personalizedSubject || 
        !recipient.personalizedBody
    )

    if (invalidRecipients.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid recipient data structure. Each recipient must have email, name, and personalized content.",
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
        console.error("Error in creating the email campaign", error)
        res.status(500).json({
            success: false,
            message: "Failed to create email campaign",
            error: error.message,
        })
    }
}

const sendBulkEmails = async (req, res) => {
    try {
        console.log('Starting bulk email send process...');
        const { mailId } = req.params;
        console.log('Campaign ID:', mailId);

        const campaign = await EmailCampaign.findOne({ _id: mailId });
        if (!campaign) {
            console.log('Campaign not found:', mailId);
            return res.status(400).json({
                success: false,
                message: "Email campaign not found"
            });
        }
        console.log('Found campaign:', campaign._id);

        const user = await User.findById(campaign.senderId);
        console.log('Looking for user:', campaign.senderId);

        if (!user || !user.emailConfigs || user.emailConfigs.length === 0) {
            console.log('User or email config not found:', user?._id);
            return res.status(400).json({
                success: false,
                message: 'No sender email configured. Please add an email configuration first.'
            });
        }

        const selectedConfig = user.emailConfigs.find(config => config.senderEmail === campaign.senderEmail);
        console.log('Selected email config for:', campaign.senderEmail);

        if (!selectedConfig) {
            console.log('Sender email config not found for:', campaign.senderEmail);
            return res.status(400).json({
                success: false,
                message: 'Sender email configuration not found. Please reconfigure your email settings.'
            });
        }

        // Log the structure for debugging
        console.log('Encrypted app password structure:', {
            encrypted: selectedConfig.encryptedAppPassword.encrypted ? 'present' : 'missing',
            iv: selectedConfig.encryptedAppPassword.iv ? 'present' : 'missing',
            authTag: selectedConfig.encryptedAppPassword.authTag ? 'present' : 'missing'
        });

        try {
            // Ensure we're passing the correct structure to decrypt
            const decryptedAppPassword = protection.decrypt({
                encrypted: selectedConfig.encryptedAppPassword.encrypted,
                iv: selectedConfig.encryptedAppPassword.iv,
                authTag: selectedConfig.encryptedAppPassword.authTag
            });
            console.log('Successfully decrypted app password');

            // Test the decrypted password
            const transporter = createTransporter(campaign.senderEmail, decryptedAppPassword);
            await transporter.verify();
            console.log('Email transporter verified successfully');

            campaign.status = 'processing';
            await campaign.save();
            console.log('Campaign status updated to processing');

            const emailPromises = campaign.recipientData.map(async (recipient) => {
                const { recipientName, recipientEmail, personalizedSubject, personalizedBody } = recipient;

                const mailOptions = {
                    from: `${user.userName} <${campaign.senderEmail}>`,
                    to: recipientEmail,
                    subject: personalizedSubject || campaign.subject,
                    html: personalizedBody || campaign.body,
                    text: convert(personalizedBody || campaign.body),
                };

                try {
                    await transporter.sendMail(mailOptions);
                    recipient.status = 'sent';
                    campaign.stats.sent++;
                    console.log('Email sent successfully to:', recipientEmail);
                    return {
                        recipientEmail,
                        status: 'sent',
                    };
                } catch (error) {
                    console.error(`Failed to send email to ${recipientEmail}:`, error.message);
                    recipient.status = 'failed';
                    recipient.error = error.message;
                    campaign.stats.failed++;
                    return {
                        recipientEmail,
                        status: 'failed',
                        error: error.message
                    };
                }
            });

            console.log('Starting to send emails to all recipients...');
            const results = await Promise.allSettled(emailPromises);
            console.log('Email sending completed. Results:', results.length);

            campaign.status = campaign.stats.failed === 0 ? 'completed' : 'failed';
            await campaign.save();
            console.log('Campaign status updated to:', campaign.status);

            res.status(200).json({
                success: true,
                message: `Email campaign completed. ${campaign.stats.sent} sent, ${campaign.stats.failed} failed`
            });
        } catch (error) {
            console.error('Error in email processing:', error);
            campaign.status = 'failed';
            await campaign.save();
            
            res.status(500).json({
                success: false,
                message: error.message || "Failed to send emails"
            });
        }
    } catch (error) {
        console.error("Error in sending bulk emails:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to send emails"
        });
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
            console.log('Email configuration verified successfully for:', senderEmail)
        } catch (error) {
            console.error('Email verification failed:', error.message)
            return res.status(400).json({
                success: false,
                message: 'Invalid email credentials. Please check your email and app password. Make sure 2-factor authentication is enabled and you are using an app password.'
            })
        }

        // Encrypt the app password
        const encryptedData = protection.encrypt(appPassword)

        // Check if email already exists and update, or add new
        const existingConfigIndex = user.emailConfigs.findIndex(config => config.senderEmail === senderEmail)
        
        if (existingConfigIndex !== -1) {
            // Update existing configuration
            user.emailConfigs[existingConfigIndex].encryptedAppPassword = {
                encrypted: encryptedData.encrypted,
                iv: encryptedData.iv,
                authTag: encryptedData.authTag
            }
            console.log('Updated existing email configuration for:', senderEmail)
        } else {
            // Add new configuration
            user.emailConfigs.push({
                senderEmail,
                encryptedAppPassword: {
                    encrypted: encryptedData.encrypted,
                    iv: encryptedData.iv,
                    authTag: encryptedData.authTag
                }
            })
            console.log('Added new email configuration for:', senderEmail)
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: `Email configuration ${existingConfigIndex !== -1 ? 'updated' : 'added'} successfully`,
            emailConfigAdded: senderEmail
        })
    } catch (error) {
        console.error("Add email config error: ", error)
        res.status(500).json({
            success: false,
            message: 'Failed to add email configuration',
            error: error.message
        })
    }
}

const deleteEmailConfig = async (req, res) => {
    try {
        const { senderEmail } = req.body;

        if (!senderEmail) {
            return res.status(400).json({
                success: false,
                message: "Sender email is required"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if the configuration exists
        const configExists = user.emailConfigs.some(config => config.senderEmail === senderEmail);
        
        if (!configExists) {
            return res.status(404).json({
                success: false,
                message: "Email configuration not found"
            });
        }

        // Remove the email config
        user.emailConfigs = user.emailConfigs.filter(config => config.senderEmail !== senderEmail);
        await user.save();

        console.log('Deleted email configuration for:', senderEmail);

        res.status(200).json({
            success: true,
            message: 'Email configuration deleted successfully'
        });
    } catch (error) {
        console.error("Delete email config error: ", error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete email configuration',
            error: error.message
        });
    }
};

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
            stats: campaign.stats,
            recipients: campaign.recipientData.map(recipient => ({
                name: recipient.recipientName,
                email: recipient.recipientEmail,
                status: recipient.status,
                error: recipient.error || null,
                customFields: recipient.customFields || {}
            }))
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
    deleteEmailConfig,
    getEmailConfigs, // Add this export
    getSentEmails,
    getEmailStats
}