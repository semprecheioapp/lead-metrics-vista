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
    console.log('Starting auto follow-up processing...');

    // Usar Service Role Key para acesso completo aos dados
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar todas as empresas com follow-up automático ativado
    const { data: empresasConfig, error: configError } = await supabaseAdmin
      .from('configuracoes_empresa')
      .select(`
        empresa_id,
        horario_funcionamento,
        empresas!inner(
          id,
          name_empresa,
          ativo
        )
      `)
      .eq('empresas.ativo', true);

    if (configError) {
      console.error('Error fetching empresa configs:', configError);
      throw new Error(`Error fetching configurations: ${configError.message}`);
    }

    console.log(`Found ${empresasConfig?.length || 0} active companies`);

    let totalProcessed = 0;
    let totalSent = 0;

    // Processar cada empresa
    for (const config of empresasConfig || []) {
      const followupConfig = config.horario_funcionamento as any || {};
      
      // Verificar se follow-up automático está ativado
      if (!followupConfig.auto_followup_enabled) {
        console.log(`Company ${config.empresa_id} has auto follow-up disabled, skipping...`);
        continue;
      }

      const empresaId = config.empresa_id;
      const tempoAbandonoDias = followupConfig.tempo_abandono_dias || 3;
      const templateFollowup = followupConfig.template_followup || 
        "Olá {nome}, notamos que você demonstrou interesse em nossos produtos. Podemos ajudá-lo a dar continuidade?";

      console.log(`Processing company ${empresaId} with ${tempoAbandonoDias} days abandonment time`);

      // Calcular data limite para considerar lead abandonado
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - tempoAbandonoDias);

      // Buscar leads que precisam de follow-up automático
      const { data: leads, error: leadsError } = await supabaseAdmin
        .from('novos_leads')
        .select('id, name, number, etapa, updated_at, followup_count, ultimo_followup, qualificacao')
        .eq('empresa_id', empresaId)
        .lt('updated_at', dataLimite.toISOString())
        .lt('followup_count', 3) // Máximo 3 follow-ups automáticos
        .or(`ultimo_followup.is.null,ultimo_followup.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`) // Sem follow-up ou último foi há mais de 24h
        .in('etapa', [1, 2, 3]); // Apenas leads em etapas iniciais

      if (leadsError) {
        console.error(`Error fetching leads for company ${empresaId}:`, leadsError);
        continue;
      }

      if (!leads || leads.length === 0) {
        console.log(`No leads requiring follow-up found for company ${empresaId}`);
        continue;
      }

      console.log(`Found ${leads.length} leads requiring follow-up for company ${empresaId}`);
      totalProcessed += leads.length;

      // Preparar dados para envio
      const webhookData = {
        empresa_id: empresaId,
        auto_followup: true, // Flag para indicar que é follow-up automático
        leads: leads.map(lead => ({
          id: lead.id,
          nome: lead.name,
          telefone: lead.number,
          etapa: lead.etapa,
          dias_parado: Math.floor((new Date().getTime() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
          ultima_interacao: lead.updated_at,
          qualificacao: lead.qualificacao,
          followup_count: lead.followup_count || 0
        })),
        template_followup: templateFollowup,
        configuracoes_empresa: {
          nome_empresa: config.empresas.name_empresa || "Empresa",
          auto_followup_enabled: true
        }
      };

      console.log(`Sending auto follow-up for company ${empresaId} to webhook...`);

      try {
        // Enviar para webhook externo
        const webhookResponse = await fetch('https://wb.semprecheioapp.com.br/webhook/follow_dash_mbk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });

        const webhookResult = await webhookResponse.json();
        console.log(`Webhook response for company ${empresaId}:`, webhookResult);

        if (webhookResponse.ok && webhookResult.success) {
          totalSent += leads.length;

          // Atualizar leads com sucesso
          for (const lead of leads) {
            const newFollowupCount = (lead.followup_count || 0) + 1;
            
            const { error: updateError } = await supabaseAdmin
              .from('novos_leads')
              .update({ 
                followup_count: newFollowupCount,
                ultimo_followup: new Date().toISOString()
              })
              .eq('id', lead.id)
              .eq('empresa_id', empresaId);

            if (updateError) {
              console.error(`Error updating lead ${lead.id}:`, updateError);
            } else {
              console.log(`Auto follow-up sent successfully for lead ${lead.id} (count: ${newFollowupCount})`);
            }
          }

          // Registrar log de sucesso
          await supabaseAdmin
            .from('logs_erros_agent')
            .insert({
              empresa_id: empresaId,
              workflowname: 'auto_followup',
              description: `Auto follow-up enviado para ${leads.length} leads`,
              json: {
                leads_count: leads.length,
                webhook_response: webhookResult
              },
              queue: false
            });

        } else {
          console.error(`Webhook failed for company ${empresaId}:`, webhookResult);
          
          // Registrar log de erro
          await supabaseAdmin
            .from('logs_erros_agent')
            .insert({
              empresa_id: empresaId,
              workflowname: 'auto_followup',
              description: `Erro no webhook de auto follow-up: ${webhookResult.message || 'Unknown error'}`,
              json: {
                leads_count: leads.length,
                error: webhookResult
              },
              queue: true
            });
        }

      } catch (webhookError) {
        console.error(`Error calling webhook for company ${empresaId}:`, webhookError);
        
        // Registrar log de erro
        await supabaseAdmin
          .from('logs_erros_agent')
          .insert({
            empresa_id: empresaId,
            workflowname: 'auto_followup',
            description: `Erro de conexão no webhook de auto follow-up: ${webhookError.message}`,
            json: {
              leads_count: leads.length,
              error: webhookError.message
            },
            queue: true
          });
      }
    }

    console.log(`Auto follow-up processing completed. Processed: ${totalProcessed}, Sent: ${totalSent}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Auto follow-up processing completed',
      total_processed: totalProcessed,
      total_sent: totalSent,
      companies_processed: empresasConfig?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auto follow-up processing:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});