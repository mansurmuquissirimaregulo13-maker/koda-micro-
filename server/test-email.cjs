require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Koda Admin <onboarding@resend.dev>',
            to: ['mansurmuquissirimaregulo13@gmail.com'],
            subject: 'Test Email from Koda Admin',
            html: '<p>If you see this, the email integration is working!</p>',
        });

        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent successfully:', data);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
})();
