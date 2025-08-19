import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create two Supabase clients: one for auth verification, one for data access
    const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false,
        detectSessionInUrl: false 
      }
    });

    // Create admin client for data access (bypasses RLS)
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    console.log('Authorization header found, setting session...');

    // Set auth for this request
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log(`User authenticated: ${user.id}`);

    const { empresaId, analysisType = 'conversation', customPrompt, startDate, endDate, periodType } = await req.json();

    console.log('Dados recebidos:', { empresaId, analysisType, startDate, endDate, periodType });

    if (!empresaId) {
      throw new Error('empresaId é obrigatório');
    }

    if (!customPrompt || !customPrompt.trim()) {
      throw new Error('Prompt personalizado é obrigatório');
    }

    if (!startDate || !endDate) {
      console.error('Datas não fornecidas - startDate:', startDate, 'endDate:', endDate);
      throw new Error('Período (startDate e endDate) é obrigatório');
    }

    console.log(`Iniciando análise ${analysisType} para empresa ${empresaId}`);

    // Get company data based on analysis type
    let data, analysisPrompt, tableName;

    if (analysisType === 'conversation') {
      // Analyze conversations using admin client
      console.log(`Buscando conversas para empresa ${empresaId} no período ${startDate} - ${endDate}...`);
      const { data: conversations, error: convError } = await supabaseAdmin
        .from('memoria_ai')
        .select('*')
        .eq('empresa_id', empresaId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(200);

      if (convError) {
        console.error('Erro ao buscar conversas:', convError);
        throw convError;
      }

      console.log(`Encontradas ${conversations?.length || 0} conversas`);
      data = conversations;
      tableName = 'conversation_analysis';
      
      // Use custom prompt with conversation data
      analysisPrompt = `${customPrompt}

Dados das conversas para análise:
${JSON.stringify(data?.slice(0, 20) || [])}

Forneça uma análise detalhada e estruturada em formato JSON.`;

    } else if (analysisType === 'leads') {
      // Analyze leads using admin client
      console.log(`Buscando leads para empresa ${empresaId} no período ${startDate} - ${endDate}...`);
      const { data: leads, error: leadsError } = await supabaseAdmin
        .from('novos_leads')
        .select('*')
        .eq('empresa_id', empresaId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(300);

      if (leadsError) {
        console.error('Erro ao buscar leads:', leadsError);
        throw leadsError;
      }

      console.log(`Encontrados ${leads?.length || 0} leads`);
      data = leads;
      tableName = 'ai_insights';
      
      // Use custom prompt with leads data
      analysisPrompt = `${customPrompt}

Dados dos leads para análise:
${JSON.stringify(data?.slice(0, 30) || [])}

Forneça uma análise detalhada e estruturada em formato JSON.`;
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Nenhum dado encontrado para análise',
        insights: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Format date label for display
    const formatDateLabel = (start: string, end: string, type: string): string => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) return 'Hoje';
      if (diffDays <= 7) return 'Últimos 7 dias';
      if (diffDays <= 14) return 'Últimas 2 semanas';
      if (diffDays <= 31) return 'Último mês';
      return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
    };

    // Enviar dados para webhook externo
    console.log('Enviando dados para webhook externo...');
    
    const webhookPayload = {
      empresa_id: empresaId,
      analysis_type: analysisType,
      custom_prompt: customPrompt,
      start_date: startDate,
      end_date: endDate,
      period_type: periodType || 'custom',
      date_filter_label: formatDateLabel(startDate, endDate, periodType || 'custom'),
      conversations: data,
      total_conversations: data.length
    };
    
    console.log('Payload do webhook:', JSON.stringify(webhookPayload, null, 2));
    
    const webhookResponse = await fetch('https://wb.semprecheioapp.com.br/webhook/analise_conversas_dashmbk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook error: ${webhookResponse.status} - ${webhookResponse.statusText}`);
      throw new Error(`Webhook error: ${webhookResponse.statusText}`);
    }

    console.log('Webhook response status:', webhookResponse.status);
    console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

    // Verificar se há conteúdo na resposta
    const responseText = await webhookResponse.text();
    console.log('Webhook response text:', responseText);

    let webhookResult;
    if (responseText.trim()) {
      try {
        webhookResult = JSON.parse(responseText);
        console.log('Webhook result parsed:', webhookResult);
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta do webhook:', parseError);
        console.log('Response text que causou erro:', responseText);
        // Se não conseguir fazer parse, usar a resposta como texto estruturado
        webhookResult = { 
          resumo: "Análise de IA Gerada",
          analise_completa: responseText,
          recomendacoes: [
            "Análise baseada nas conversas processadas",
            "Revisar os dados para identificar padrões de atendimento"
          ]
        };
      }
    } else {
      console.log('Webhook retornou resposta vazia');
      webhookResult = { 
        resumo: "Webhook sem retorno",
        analise_completa: "O webhook foi processado mas não retornou dados específicos.",
        recomendacoes: [
          "Verificar configuração do webhook n8n",
          "Confirmar se a IA está processando os dados corretamente"
        ]
      };
    }

    console.log('Análise gerada com sucesso');

    // Estruturar a resposta de forma consistente
    let finalAnalysis;
    
    // Se o webhook retornou um objeto estruturado, usar diretamente
    if (typeof webhookResult === 'object' && webhookResult !== null) {
      finalAnalysis = webhookResult;
    } else {
      // Se retornou string, estruturar
      finalAnalysis = {
        resumo: "Análise de Conversas",
        analise_completa: typeof webhookResult === 'string' ? webhookResult : JSON.stringify(webhookResult),
        recomendacoes: [
          "Análise processada pelo sistema de IA",
          "Baseada nos dados das conversas do período"
        ]
      };
    }

    console.log('Análise processada com sucesso, retornando dados:', finalAnalysis);

    return new Response(JSON.stringify({
      success: true,
      analysis: finalAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na análise:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro ao processar análise de IA'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});