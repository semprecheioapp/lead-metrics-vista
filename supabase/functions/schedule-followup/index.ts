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

    // Inserir na tabela de followups dedicada
    const { data: followup, error: followupError } = await supabase
      .from('followups')
      .insert({
        empresa_id: empresaId,
        lead_nome: leadData.name,
        lead_telefone: leadId,
        mensagem: message,
        data_envio: scheduledDate,
        status: 'agendado'
      })
      .select()
      .single();

    if (followupError) {
      console.error('Erro ao inserir follow-up:', followupError);
      throw new Error(`Erro ao agendar follow-up: ${followupError.message}`);
    }

    console.log('Follow-up agendado com sucesso:', followup);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Follow-up agendado com sucesso',
        followup_id: followup.id,
        data_envio: followup.data_envio
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