import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar Service Role Key para acesso completo aos dados
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Criar cliente com anon key para verificar autenticação do usuário
    const supabaseAnon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }

    console.log('User authenticated:', user.id);

    const { leads } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      throw new Error('Leads array is required');
    }

    console.log(`Processing follow-up for ${leads.length} leads`);

    // Buscar dados da empresa do primeiro lead
    const firstLead = leads[0];
    
    // Buscar empresa_id através do profile do usuário usando admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    console.log('Profile query result:', { profile, profileError, userId: user.id });

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    if (!profile?.empresa_id) {
      console.error('Profile found but no empresa_id:', profile);
      throw new Error('Company ID not found for user');
    }

    const empresaId = profile.empresa_id;
    console.log('Found empresa_id:', empresaId);

    // Buscar dados da empresa usando admin client
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('name_empresa')
      .eq('id', empresaId)
      .single();

    if (empresaError) {
      console.error('Error fetching empresa:', empresaError);
    }

    // Buscar configurações da empresa usando admin client
    const { data: config, error: configError } = await supabaseAdmin
      .from('configuracoes_empresa')
      .select('horario_funcionamento, prompt_sistema')
      .eq('empresa_id', empresaId)
      .maybeSingle();

    if (configError) {
      console.error('Error fetching config:', configError);
    }

    // Extrair template de follow-up das configurações
    const followupConfig = config?.horario_funcionamento as any || {};
    const templateFollowup = followupConfig.template_followup || 
      "Olá {nome}, notamos que você demonstrou interesse em nossos produtos. Podemos ajudá-lo a dar continuidade?";

    // Preparar dados para envio
    const webhookData = {
      empresa_id: empresaId,
      leads: leads.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        etapa: lead.etapa,
        dias_parado: lead.dias_parado,
        ultima_interacao: lead.ultima_interacao,
        qualificacao: lead.qualificacao
      })),
      template_followup: templateFollowup,
      configuracoes_empresa: {
        nome_empresa: empresa?.name_empresa || "Empresa",
        prompt_sistema: config?.prompt_sistema || "Você é um assistente de vendas especializado."
      }
    };

    console.log('Sending data to webhook:', JSON.stringify(webhookData, null, 2));

    // Enviar para webhook externo
    const webhookResponse = await fetch('https://wb.semprecheioapp.com.br/webhook/follow_dash_mbk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const webhookResult = await webhookResponse.json();
    console.log('Webhook response:', webhookResult);

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResult.message || 'Unknown error'}`);
    }

    // Atualizar status dos leads processados com sucesso
    if (webhookResult.success && webhookResult.leads_processados) {
      console.log('Webhook leads processados:', webhookResult.leads_processados);
      console.log('Leads originais enviados:', leads.map(l => ({ id: l.id, nome: l.nome })));
      
      // Usar os IDs dos leads originais em vez dos retornados pelo webhook
      const originalLeadIds = leads.map(lead => lead.id);
      
      // Verificar se todos os leads foram processados com sucesso
      const successfullyProcessed = webhookResult.leads_processados
        .filter((item: any) => item.status === 'enviado').length;

      if (successfullyProcessed > 0 && originalLeadIds.length > 0) {
        console.log('Updating followup_count for leads:', originalLeadIds);
        
        // Primeiro buscar os leads para pegar o followup_count atual
        const { data: currentLeads, error: fetchError } = await supabaseAdmin
          .from('novos_leads')
          .select('id, followup_count')
          .in('id', originalLeadIds)
          .eq('empresa_id', empresaId);

        if (fetchError) {
          console.error('Error fetching current leads:', fetchError);
        } else {
          console.log('Current leads data:', currentLeads);
          
          // Atualizar cada lead individualmente incrementando o contador
          for (const lead of currentLeads) {
            const newFollowupCount = (lead.followup_count || 0) + 1;
            console.log(`Updating lead ${lead.id}: followup_count ${lead.followup_count} -> ${newFollowupCount}`);
            
            const { error: updateError } = await supabaseAdmin
              .from('novos_leads')
              .update({ 
                updated_at: new Date().toISOString(),
                followup_count: newFollowupCount,
                ultimo_followup: new Date().toISOString()
              })
              .eq('id', lead.id)
              .eq('empresa_id', empresaId);

            if (updateError) {
              console.error(`Error updating lead ${lead.id}:`, updateError);
            } else {
              console.log(`Successfully updated lead ${lead.id} followup_count to ${newFollowupCount}`);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Follow-up enviado com sucesso',
      leads_processados: leads.length,
      webhook_response: webhookResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-followup function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});