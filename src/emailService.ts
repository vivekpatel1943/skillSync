import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// configuring the environment variables
dotenv.config();

export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string
) => {
    // create transporter
    const transporter = nodemailer.createTransport({
        service: "gmail", //Or use 'host' , 'port' etc. for custom SMTP
        auth: {
            user: process.env.EMAIL_USER, //your email address
            pass: process.env.EMAIL_PASS // App password (for gmail , use an app password)
        }
    });

    // sendEmail 
    const info = await transporter.sendMail({
        from: `SkillSync <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html

    })

    console.log("Message sent %s", info.messageId)
}