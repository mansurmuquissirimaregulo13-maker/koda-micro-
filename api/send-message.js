/* eslint-env node */
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ujszmgrmutidovbhnfvl.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/whatsapp-service`;

export default async function handler(req, res) {
    // CORS support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message are required' });
    }

    try {
        console.log('Sending message to WhatsApp service:', phone);
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                to: phone,
                message: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send message via edge function');
        }

        const data = await response.json();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('WhatsApp Error:', error);
        return res.status(500).json({ error: 'Failed to send WhatsApp message: ' + error.message });
    }
}
