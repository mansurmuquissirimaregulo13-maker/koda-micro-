require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = 'mansurmuquissirimaregulo13@gmail.com';
const userEmail = 'mansurmuquissirimaregulo13@gmail.com'; // Sending to admin for verification
const companyName = 'Teste Company Lda';
const fullName = 'Novo Usuario Teste';

(async () => {
    console.log('--- Starting Registration Email Test ---');

    // 1. Simulate Admin Notification
    console.log('1. Sending Admin Notification...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Koda Admin <onboarding@resend.dev>',
            to: [adminEmail],
            subject: 'Nova Empresa Registrada (TESTE)',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Nova Empresa Registrada (TESTE)</h1>
            <p><strong>Nome da Empresa:</strong> ${companyName}</p>
            <p><strong>Usuário:</strong> ${fullName} (${userEmail})</p>
            <p>Verifique o painel administrativo para aprovar ou rejeitar.</p>
        </div>
      `
        });
        if (error) console.error('Admin Email Failed:', error);
        else console.log('Admin Email Sent:', data);
    } catch (err) {
        console.error('Admin Email Exception:', err);
    }

    // 2. Simulate User Notification
    console.log('2. Sending User Notification...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Koda Admin <onboarding@resend.dev>',
            to: [userEmail],
            subject: 'Cadastro Realizado - Aguardando Aprovação (TESTE)',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ca8a04;">Aguardando Aprovação (TESTE)</h1>
            <p>Olá ${fullName},</p>
            <p>Seu cadastro para a empresa <strong>${companyName}</strong> foi recebido com sucesso.</p>
            <p>Sua conta está atualmente <strong>pendente de aprovação</strong> pelo administrador.</p>
            <p>Você receberá um novo e-mail assim que sua conta for ativada.</p>
        </div>
      `
        });
        if (error) console.error('User Email Failed:', error);
        else console.log('User Email Sent:', data);
    } catch (err) {
        console.error('User Email Exception:', err);
    }

    console.log('--- Test Completed ---');
})();
