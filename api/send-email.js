import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const { data, error } = await resend.emails.send({
            from: 'Koda Admin <onboarding@resend.dev>',
            to: [email],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Resend API Error:', error);
            return res.status(400).json({ error: error.message });
        }

        console.log('Email sent successfully:', data);
        return res.status(200).json({ data });

    } catch (error) {
        console.error('Server error sending email:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
