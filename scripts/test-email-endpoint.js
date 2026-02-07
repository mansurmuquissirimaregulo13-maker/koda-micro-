const fetch = require('node-fetch'); // Need to ensure node-fetch is available or use native fetch in Node 18+

const API_URL = 'https://koda-micro-mansurmuquissirimaregulo13-maker.vercel.app'; // I need to get the exact URL from the user or infer it. The user said "koda-micro" in the path previously? No, wait.
// The user hasn't given the URL yet. I'll use a placeholder or ask.
// Actually, `config.ts` has a default. I'll assume standard Vercel URL structure or ask user.
// Better: I'll make a script that takes the URL as an arg.

const targetUrl = process.argv[2] || 'https://koda-micro.vercel.app'; // Placeholder

async function testEmail() {
    console.log(`Testing email sending to: ${targetUrl}/api/send-email`);
    try {
        const response = await fetch(`${targetUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mansurmuquissirimaregulo13@gmail.com',
                subject: 'Teste de Verificação Vercel',
                html: '<p>Se você recebeu isso, o envio de email está funcionando!</p>'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

testEmail();
