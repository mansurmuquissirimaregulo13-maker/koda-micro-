import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configurações fornecidas pelo Mansur
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || "re_5FPVavdG_DDBy8nXGFNT64o8EqMUKWMnL";
const SENDER_NAME = "Mansur Regulo - Koda Microcrédito";
const OFFICIAL_RESEND_SENDER = "onboarding@resend.dev";
const MANSUR_EMAIL = "mansurmuquissirimaregulo13@gmail.com";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
    console.log(`[LOG] Requisição ${req.method} recebida em ${new Date().toISOString()}`);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 204 });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || "";
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const payload = await req.json();
        console.log("[LOG] Payload:", JSON.stringify(payload));

        const { type, email, full_name, status, company_name, user_id } = payload;
        const loginLink = "https://unexa-sistema.vercel.app/login";

        // --- Action: Delete User ---
        if (type === 'delete_user') {
            if (!user_id) throw new Error("ID do usuário é obrigatório para exclusão.");

            console.log(`[LOG] Excluindo usuário da Auth: ${user_id}`);
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

            if (deleteError) {
                console.error("[ERRO_AUTH_DELETE]", deleteError.message);
                throw deleteError;
            }

            console.log(`[SUCESSO] Usuário ${user_id} removido da Auth.`);
            return new Response(JSON.stringify({ success: true, message: "Usuário removido da Auth e Banco de Dados (via Cascade)." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // --- Action: Notifications (Email) ---
        let subject = "";
        let htmlContent = "";

        if (type === 'new_registration') {
            subject = "🔔 Novo Parceiro na Koda Microcrédito";
            htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #1B3A2D; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Novo Cadastro Recebido</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Mansur, um novo usuário acaba de se registrar no sistema:</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${full_name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Empresa:</strong> ${company_name || 'Não informada'}</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${loginLink}/admin/dashboard" style="background: #1B3A2D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Aprovar Cadastro no Cockpit</a>
            </div>
          </div>
        </div>
      `;

            try {
                await sendEmail(MANSUR_EMAIL, subject, htmlContent, OFFICIAL_RESEND_SENDER);
            } catch (e) { console.warn("[AVISO] Falha ao notificar admin:", e.message); }

            subject = "🚀 Bem-vindo à Koda Microcrédito - Recebemos seu cadastro";
            htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background: #1B3A2D; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Olá, ${full_name}! 👋</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Estamos muito felizes em ter você conosco na Koda Microcrédito.</p>
            <p>Seu cadastro para a empresa <strong>${company_name || 'sua empresa'}</strong> foi recebido com sucesso e já está sendo analisado pela nossa equipe de conformidade.</p>
            <p><strong>Fique atento:</strong> Enviaremos um novo e-mail assim que sua conta for liberada para acesso.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Koda Microcrédito</p>
          </div>
        </div>
      `;
            try {
                await sendEmail(email, subject, htmlContent, MANSUR_EMAIL);
            } catch (e) { console.warn("[CLIENT_EMAIL_FAIL]", e.message); }

        } else if (type === 'status_update') {
            subject = status === 'approved'
                ? "✅ Sua conta na Koda Microcrédito foi APROVADA!"
                : "Atualização de Status - Koda Microcrédito";

            htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background: ${status === 'approved' ? '#1B3A2D' : '#333'}; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${status === 'approved' ? 'Acesso Liberado!' : 'Solicitação Reprovada'}</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            ${status === 'approved' ? `
              <p style="font-size: 16px;">Parabéns, ${full_name}! Sua conta foi aprovada e já está 100% ativa.</p>
              <p>Você já pode acessar todas as funcionalidades do sistema Koda.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${loginLink}" style="background: #1B3A2D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Entrar no Sistema</a>
              </div>
            ` : `
              <p>Olá, ${full_name}. Agradecemos seu interesse na Koda Microcrédito.</p>
              <p>Infelizmente não foi possível validar seu cadastro neste momento.</p>
            `}
          </div>
        </div>
      `;
            try {
                await sendEmail(email, subject, htmlContent, MANSUR_EMAIL);
            } catch (e) { console.warn("[CLIENT_STATUS_FAIL]", e.message); }
        } else if (type === 'removed') {
            subject = "Sua conta Koda foi removida";
            htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #991b1b;">Conta Removida</h1>
          <p>Olá ${full_name},</p>
          <p>Informamos que sua conta na Koda Microcrédito foi removida seguindo os protocolos de administração.</p>
          <p>Você pode criar uma nova conta a qualquer momento se desejar.</p>
        </div>
      `;
            try {
                await sendEmail(email, subject, htmlContent, MANSUR_EMAIL);
            } catch (e) { console.warn("[CLIENT_REMOVE_FAIL]", e.message); }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("[ERRO_FATAL]", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});

async function sendEmail(to: string, subject: string, html: string, fromEmail: string) {
    const fromValue = `${SENDER_NAME} <${fromEmail}>`;
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromValue,
            to: [to],
            subject: subject,
            html: html,
        }),
    });

    if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`Resend Rejeitou: ${JSON.stringify(errorBody)}`);
    }

    return await res.json();
}
