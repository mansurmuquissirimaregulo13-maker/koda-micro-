const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

let qrCodeData = null;
let isReady = false;

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrCodeData = qr;
    isReady = false;
    io.emit('qr', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    isReady = true;
    qrCodeData = null;
    io.emit('ready', true);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
    io.emit('authenticated', true);
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
    io.emit('auth_failure', msg);
});

client.initialize();

io.on('connection', (socket) => {
    console.log('a user connected');
    if (qrCodeData) {
        socket.emit('qr', qrCodeData);
    }
    if (isReady) {
        socket.emit('ready', true);
    }
});



const nodemailer = require('nodemailer');

app.post('/api/send-email', async (req, res) => {
    const payload = req.body;

    // If payload has a 'type' (e.g., delete_user, status_update), forward to Supabase Edge Function
    if (payload.type) {
        try {
            console.log('Proxying request to Supabase Edge Function:', payload.type);
            const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ujszmgrmutidovbhnfvl.supabase.co';
            const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-notification-email`;

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

    const { email, subject, html } = payload;

    if (!email || !subject || !html) {
        return res.status(400).json({ error: 'Email, subject, and html content are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: `"Koda Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: html,
        });

        console.log('Message sent: %s', info.messageId);
        res.status(200).json({ data: info });
    } catch (error) {
        console.error('Server error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/send-message', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client not ready' });
    }

    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message required' });
    }

    try {
        // Format phone number (append @c.us if not present, strip symbols)
        // This is a basic formatter, might need adjustment based on region (Mozambique +258)
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.endsWith('@c.us')) {
            formattedPhone += '@c.us';
        }

        const response = await client.sendMessage(formattedPhone, message);
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
