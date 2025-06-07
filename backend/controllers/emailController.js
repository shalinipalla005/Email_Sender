const nodemailer = require("nodemailer")

const Users = require("../models/users")
const Mails = require('../models/mails')

const {convert} = require('html-to-text')
const protection = require("../utils/encryptionUtils");


const createTransporter = (email, password) => {
    const transporter = nodemailer.createTransport({
        host : 'smtp.gmail.com',
        port : 465,
        secure : true,
        auth : {
            user : email,
            pass : password,
        },
    })

    return transporter
}

const createEmail = async (req, res) => {
    const {subject, body, recipientData, senderId, senderEmail} = req.body

    if(!subject || !body || !recipientData || !senderId || !senderEmail){
        return res.status(400).json({
            success : false,
            message : "all fileds are required",
        })
    }
    
    try{

        const processedRecipientData = recipientData.map(recipient => {
            const {recipientName, recipientEmail, ...dynamicFields} = recipient;
            
            return {
                recipientName,
                recipientEmail,
                dynamicFields: new Map(Object.entries(dynamicFields))
            };
        });

        const mailRecord = new Mails({
            senderId,
            senderEmail,

            recipientData,

            subject,
            body,
        })

        await mailRecord.save()

        res.status(201).json({
            success : true,
            message : 'Email data stored successfully',
            mailId : mailRecord._id,
            data : mailRecord,
        })
    }
    catch(error){
        console.log("Error in creating the mail record")
        res.status(500).json({
            success : false,
            message : "Failed to store email data",
            error : error.message,
        })
    }

}

const sendBulkEmails = async (req, res) => {
    try{
        const { mailId } = req.params

        const mailRecord = await Mails.findOne({_id : mailId})

        if(!mailRecord) {
            return res.status(400).json({
                success : false,
                message : "Email not found",
            })
        }

        // const {userId, senderEmailToUse} = req.body;
        const userId = mailRecord.senderId;
        const senderEmailToUse = mailRecord.senderEmail;

        const user = await Users.findById(userId);

        if(!user || !user.emailConfigs || user.emailConfigs.length == 0){
            throw Error('No sender email configured for the user');
        }

        const selectedConfig = user.emailConfigs.find(config => config.senderEmail === senderEmailToUse);

        if(!selectedConfig){
            throw Error('Sender Email not found');
        }

        console.log(selectedConfig.encryptedAppPassword)

        const decryptedAppPassword = protection.decrypt(selectedConfig.encryptedAppPassword);

        
        const { subject, body, recipientData, senderEmail } = mailRecord;
        
        const transporter = createTransporter(senderEmail, decryptedAppPassword)

        const emailPromises = recipientData.map(async (recipient) => {
            const { recipientName , recipientEmail, dynamicFields } = recipient

            let populatedBody = body
            .replace(/{{name}}/g, recipientName)
            .replace(/{{email}}/g, recipientEmail)

            let populatedSubject = subject
            .replace(/{{name}}/g, recipientName)
            .replace(/{{email}}/g, recipientEmail)

            if(dynamicFields && dynamicFields instanceof Map){
                for(let [fieldName, fieldValue] of dynamicFields){
                    const regex = new  RegExp(`{{${fieldName}}}`, 'g');
                    populatedBody = populatedBody.replace(regex, fieldValue);
                    populatedSubject = populatedSubject.replace(regex, fieldValue);
                }
            }
            

            const mailOptions = {
                from : `"No name" <${senderEmail}>`,
                to : recipientEmail,
                subject : subject,
                html : populatedBody,
                text : convert(populatedBody),
            }


            try{
                const info = await transporter.sendMail(mailOptions)

                return {
                    recipientEmail,
                    status : 'sent',
                }
            }

            catch(error){
                console.log(`Failed to send email to ${recipientEmail} :`,error)

                return {
                    recipientEmail, 
                    status : 'failed',
                }
            }


        })

        const results = await Promise.allSettled(emailPromises)
        const emailResults = results.map((result) => 
                     result.status === 'fulfilled'
                        ? result.value
                        : {
                            status : 'failed',
                            error : result.reason?.message || 'unknown error'
                        })


        const successful = emailResults.filter((result) => result.status === 'sent').length
        const failed = emailResults.filter((result) => result.status === 'failed').length


        res.status(200).json({
            success : true,
            message : `Emailing process completed. ${successful} sent, ${failed} failed`
        })


    }
    catch(error){
        console.log('error in sending bulk emails', error)
        res.status(500).json({
            success : false,
            message : 'failed to send bulk emails',
        })
    }
}

const validateCSVData = async (req, res) => {
    try {
        const { subject, body, csvData } = req.body;
        
        // Extract variables from template
        const templateVariables = [
            ...extractVariablesFromTemplate(subject),
            ...extractVariablesFromTemplate(body)
        ];
        
        // Check if CSV headers match template variables
        const csvHeaders = csvData.length > 0 ? Object.keys(csvData[0]) : [];
        
        const missingVariables = templateVariables.filter(variable => 
            !csvHeaders.includes(variable) && 
            variable !== 'name' && 
            variable !== 'email'
        );
        
        const extraFields = csvHeaders.filter(header => 
            !templateVariables.includes(header) && 
            header !== 'recipientName' && 
            header !== 'recipientEmail'
        );
        
        res.status(200).json({
            success: true,
            templateVariables,
            csvHeaders,
            missingVariables,
            extraFields,
            isValid: missingVariables.length === 0
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to validate CSV data',
            error: error.message
        });
    }
}

const addEmailConfig = async (req, res) => {
    try{
        
        const {userId, senderEmail, appPassword} = req.body;

        if(!senderEmail || !appPassword){
            return res.status(400).json({
                success : false,
                message  : " Email and App password are required"
            })
        }

        const user = await Users.findById(userId);

        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }

        const encrypted = protection.encrypt(appPassword);

        user.emailConfigs.push({
            senderEmail,
            encryptedAppPassword : encrypted
        });

        await user.save();

        res.status(200).json({
            success : true,
            message : "Email configuration added successfully",
            emailConfigAdded : senderEmail
        })
    }catch(error){
        console.log("Add email config error: ", error);
        res.status(500).json({
            success : false,
            message : 'Failed to add email config',
        })
    }
}

module.exports = {createEmail, sendBulkEmails, addEmailConfig}