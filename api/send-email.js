import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
    // CORS support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { email, subject, html } = req.body;

    if (!email || !subject || !html) {
        return res.status(400).json({ error: 'Email, subject, and html content are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS  // Your Gmail App Password
            }
        });

        const info = await transporter.sendMail({
            from: `"Koda Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: html,
        });

        console.log('Message sent: %s', info.messageId);
        return res.status(200).json({ data: info });

    } catch (error) {
        console.error('Server error sending email:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
