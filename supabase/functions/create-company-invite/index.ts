
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCompanyRequest {
  companyName: string;
  email: string;
  companyPhone?: string;
  userName: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { companyName, email, companyPhone, userName }: CreateCompanyRequest = await req.json();

    console.log('Creating company for:', email);

    // Check if company already exists
    const { data: existingCompany } = await supabaseAdmin
      .from('empresas')
      .select('id, name_empresa')
      .eq('email', email)
      .single();

    if (existingCompany) {
      return new Response(
        JSON.stringify({ 
          error: `Já existe uma empresa cadastrada com o email ${email}`,
          code: 'COMPANY_ALREADY_EXISTS'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create the company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('empresas')
      .insert({
        name_empresa: companyName,
        email,
        telefone: companyPhone,
        plano: 'free',
        limite_leads: 1000,
        limite_mensagens: 10000,
        ativo: true
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      throw new Error(`Erro ao criar empresa: ${companyError.message}`);
    }

    console.log('Company created:', companyData.id);

    // Create initial company configuration
    const { error: configError } = await supabaseAdmin
      .from('configuracoes_empresa')
      .insert({
        empresa_id: companyData.id,
        auto_resposta: true,
        llm_enabled: false,
        reports_enabled: false,
        reports_frequency: 'weekly'
      });

    if (configError) {
      console.error('Error creating config:', configError);
      // Continue even if config creation fails
    }

    // Send email with simple instructions
    const platformUrl = `${req.headers.get('origin') || 'https://970baff3-ddb9-47c4-8267-64845ecacc9e.lovableproject.com'}/auth`;
    
    try {
      const emailResult = await resend.emails.send({
        from: 'Sistema IA <onboarding@resend.dev>',
        to: [email],
        subject: `Bem-vindo à ${companyName} - Configure sua conta`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              Bem-vindo à nossa plataforma!
            </h1>
            
            <p>Olá <strong>${userName}</strong>!</p>
            
            <p>Sua empresa <strong>${companyName}</strong> foi criada com sucesso em nossa plataforma!</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📋 Próximos passos:</h3>
              <ol style="margin-bottom: 0; color: #374151;">
                <li style="margin-bottom: 8px;">Acesse: <a href="${platformUrl}" style="color: #2563eb; font-weight: 500;">${platformUrl}</a></li>
                <li style="margin-bottom: 8px;">Clique em <strong>"Criar Conta"</strong></li>
                <li style="margin-bottom: 8px;">Use o email: <strong>${email}</strong></li>
                <li style="margin-bottom: 8px;">Crie uma senha segura</li>
                <li>Confirme seu email quando solicitado</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${platformUrl}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                🚀 ACESSAR PLATAFORMA
              </a>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #334155;">📊 Detalhes da sua conta:</h3>
              <ul style="margin-bottom: 0; color: #475569;">
                <li><strong>Empresa:</strong> ${companyName}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Plano:</strong> Gratuito</li>
                <li><strong>Limite de leads:</strong> 1.000</li>
                <li><strong>Limite de mensagens:</strong> 10.000</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Importante:</strong> Após criar sua conta, você será automaticamente vinculado à empresa ${companyName}.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Se você tem dúvidas ou precisa de ajuda, nossa equipe está aqui para auxiliar! 💬
            </p>
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Este é um email automático. Por favor, não responda a este email.
            </p>
          </div>
        `,
      });

      console.log('Email sent:', emailResult);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the whole process if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        company: companyData,
        message: `Empresa criada com sucesso! Instruções enviadas para ${email}`,
        instructions: 'O usuário deve criar uma conta usando o email fornecido'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-company-invite function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
