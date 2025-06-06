const nodemailer = require("nodemailer")
const Mails = require('../models/mails')
const {convert} = require('html-to-text')


const createTransporter = () => {
    const transporter = nodemailer.createTransport({
        host : 'smtp.gmail.com',
        port : 465,
        secure : true,
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS,
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


        const transporter = createTransporter()

        const {subject, body, senderEmail, recipientData  } = mailRecord

        const emailPromises = recipientData.map(async (recipient) => {
            const { recipientName , recipientEmail } = recipient

            const populatedBody = body
            .replace(/{{name}}/g, recipientName)
            .replace(/{{email}}/g, recipientEmail)

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

module.exports = {createEmail, sendBulkEmails}