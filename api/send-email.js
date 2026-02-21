/* eslint-env node */
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ujszmgrmutidovbhnfvl.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-notification-email`;

export default async function handler(req, res) {
    // CORS support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const payload = req.body;

    // If payload has a 'type' (e.g., delete_user, status_update), forward to Supabase Edge Function
    if (payload.type) {
        try {
            console.log('Proxying request to Supabase Edge Function:', payload.type);
            const response = await fetch(EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return res.status(response.status).json(data);
        } catch (error) {
            console.error('Proxy Error:', error);
            return res.status(500).json({ error: 'Failed to proxy request to Edge Function: ' + error.message });
        }
    }

    // Default legacy behavior for simple email sending
    const { email, subject, html } = payload;

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
