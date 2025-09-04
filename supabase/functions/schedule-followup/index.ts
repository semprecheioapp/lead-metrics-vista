import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Autenticação do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { leadId, empresaId, scheduledDate, message, leadData } = await req.json();

    console.log('Agendando follow-up:', { leadId, empresaId, scheduledDate, leadData });

    // Validar dados obrigatórios
    if (!leadId || !empresaId || !scheduledDate || !message || !leadData) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Atualizar o lead com a data do próximo follow-up (se existir)
    const { error: updateError } = await supabase
      .from('novos_leads')
      .update({
        ultimo_followup: new Date().toISOString(),
        timeout: scheduledDate, // Usar timeout para armazenar quando deve ser executado
        updated_at: new Date().toISOString()
      })
      .eq('number', leadId) // Buscar por telefone
      .eq('empresa_id', empresaId);

    if (updateError) {
      throw updateError;
    }

    // Buscar configurações da empresa
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single();

    if (empresaError) {
      throw empresaError;
    }

    // Preparar dados para o webhook
    const webhookData = {
      empresa_id: empresaId,
      nome: leadData.name,
      telefone: leadData.number,
      data_followup: scheduledDate,
      mensagem: message,
      token: empresa.token,
      instance: empresa.instance,
      host: empresa.host
    };

    console.log('Enviando para webhook:', webhookData);

    // Enviar para webhook de follow-up
    const webhookUrl = 'https://wb.semprecheioapp.com.br/webhook/follow_dash_mbk';
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', await webhookResponse.text());
      throw new Error(`Webhook failed: ${webhookResponse.status}`);
    }

    const webhookResult = await webhookResponse.json();
    console.log('Webhook response:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Follow-up agendado com sucesso',
        webhookResult 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função schedule-followup:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});