import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
// Using Brevo API via HTTPS — no Resend import


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendRequest {
  invite_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Get user profile to find company
    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id, nome')
      .eq('id', user.id)
      .single();

    if (!profile?.empresa_id) {
      throw new Error('Empresa não encontrada');
    }

    const { invite_id }: ResendRequest = await req.json();
    if (!invite_id) {
      throw new Error('ID do convite é obrigatório');
    }

    // Load pending invite for this company
    const { data: invite, error: findError } = await supabase
      .from('convites_empresa')
      .select('*')
      .eq('id', invite_id)
      .eq('company_id', profile.empresa_id)
      .eq('status', 'pending')
      .single();

    if (findError || !invite) {
      throw new Error('Convite não encontrado ou já processado');
    }

    // Generate a fresh token
    const token = crypto.randomUUID();
    const tokenHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token)
    );
    const hashArray = Array.from(new Uint8Array(tokenHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Extend expiry by 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update invite with new token hash and expiry
    const { error: updateError } = await supabase
      .from('convites_empresa')
      .update({ token_hash: hashHex, expires_at: expiresAt.toISOString() })
      .eq('id', invite_id);

    if (updateError) {
      console.error('Error updating invite token:', updateError);
      throw new Error('Erro ao atualizar token do convite');
    }

    // Fetch company name
    const { data: company } = await supabase
      .from('empresas')
      .select('name_empresa')
      .eq('id', profile.empresa_id)
      .single();

    // Send invitation email using Brevo API
    const brevoApiKey = Deno.env.get('BREVO_API_KEY') ?? '';
    const fromEmail = Deno.env.get('INVITE_FROM_EMAIL') ?? 'no-reply@yourdomain.com';
    const acceptUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/accept-invite?token=${token}`;

    const emailHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Convite para ${company?.name_empresa || 'a empresa'}</title>
  </head>
  <body style="font-family:Arial, Helvetica, sans-serif; background:#f6f9fc; padding:24px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; padding:24px;">
      <h2 style="margin:0 0 12px 0;">Você foi convidado(a) para ${company?.name_empresa || 'nossa empresa'}</h2>
      ${invite.name ? `<p style=\"margin:0 0 8px 0;\">Olá ${invite.name},</p>` : ''}
      <p style="margin:0 0 16px 0;">${profile?.nome || 'Administrador'} convidou você para acessar o MBK Dashboard.</p>
      <p style="margin:0 0 24px 0;">Clique no botão abaixo para aceitar o convite:</p>
      <p>
        <a href="${acceptUrl}" target="_blank" style="display:inline-block; padding:12px 20px; background:#111827; border-radius:6px; color:#ffffff; text-decoration:none;">Aceitar convite</a>
      </p>
      <p style="color:#6b7280; margin-top:24px;">Se o botão não funcionar, copie e cole este link no seu navegador:<br />${acceptUrl}</p>
    </div>
  </body>
</html>`;

    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'MBK Dashboard', email: fromEmail },
          to: [{ email: invite.email, name: invite.name || invite.email }],
          subject: `Convite para ${company?.name_empresa || 'a empresa'}`,
          htmlContent: emailHtml
        })
      });
      if (!brevoRes.ok) {
        const errText = await brevoRes.text();
        console.error('Brevo send error:', brevoRes.status, errText);
      }
    } catch (e) {
      console.error('Error sending via Brevo:', e);
    }

    // Log audit
    await supabase.rpc('audit_log', {
      actor_id: user.id,
      company_uuid: profile.empresa_id,
      action_name: 'agent_invite_resent',
      target_type_name: 'convite_empresa',
      target_uuid: invite.id,
      metadata_json: { email: invite.email }
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Convite reenviado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in agent-invite-resend:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
