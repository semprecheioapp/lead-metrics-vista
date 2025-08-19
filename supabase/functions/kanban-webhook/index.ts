import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  empresa_id: string
  nome_do_lead: string
  numero_do_lead: string
  status: string
  etapa_atual: number
  nome_coluna_atual: string
  nome_coluna_anterior?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { leadId, fromColumnId, toColumnId } = await req.json()

    console.log('Webhook triggered:', { leadId, fromColumnId, toColumnId })

    // Buscar informações do lead e da coluna de destino
    const { data: lead, error: leadError } = await supabase
      .from('novos_leads')
      .select('id, name, number, empresa_id, etapa')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      console.error('Erro ao buscar lead:', leadError)
      return new Response(
        JSON.stringify({ error: 'Lead não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar informações da coluna de destino
    const { data: column, error: columnError } = await supabase
      .from('kanban_colunas')
      .select('nome, webhook_ativo, webhook_url')
      .eq('id', toColumnId)
      .single()

    // Buscar informações da coluna anterior (opcional)
    let fromColumnName = null
    if (fromColumnId) {
      const { data: fromColumn } = await supabase
        .from('kanban_colunas')
        .select('nome')
        .eq('id', fromColumnId)
        .single()
      fromColumnName = fromColumn?.nome
    }

    if (columnError || !column) {
      console.error('Erro ao buscar coluna:', columnError)
      return new Response(
        JSON.stringify({ error: 'Coluna não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Se webhook não está ativo, não fazer nada
    if (!column.webhook_ativo) {
      console.log('Webhook não está ativo para esta coluna')
      return new Response(
        JSON.stringify({ message: 'Webhook não está ativo para esta coluna' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Não disparar webhook se movendo para "SEM CLASSIFICAÇÃO" ou se lead está na etapa 1
    if (column.nome === 'SEM CLASSIFICAÇÃO' || lead.etapa < 2) {
      console.log('Webhook não disparado - movido para SEM CLASSIFICAÇÃO ou lead etapa < 2')
      return new Response(
        JSON.stringify({ message: 'Webhook não disparado para SEM CLASSIFICAÇÃO ou lead etapa < 2' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Preparar payload do webhook
    const webhookPayload: WebhookPayload = {
      empresa_id: lead.empresa_id.toString(),
      nome_do_lead: lead.name || '',
      numero_do_lead: lead.number || '',
      status: column.nome,
      etapa_atual: lead.etapa,
      nome_coluna_atual: column.nome,
      nome_coluna_anterior: fromColumnName || undefined
    }

    // URL do webhook
    const webhookUrl = column.webhook_url || 'https://wb.semprecheioapp.com.br/webhook/etapa_client_dashmbk'

    // Função para enviar webhook com retry
    const sendWebhookWithRetry = async (url: string, payload: WebhookPayload, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Tentativa ${attempt} de envio do webhook para: ${url}`)
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            console.log('Webhook enviado com sucesso')
            return { success: true, status: response.status }
          } else if (response.status >= 500 && attempt < maxRetries) {
            console.log(`Erro 5xx (${response.status}) - tentando novamente...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Backoff exponencial
            continue
          } else {
            console.log(`Erro no webhook: ${response.status}`)
            return { success: false, status: response.status, error: await response.text() }
          }
        } catch (error) {
          console.error(`Erro na tentativa ${attempt}:`, error)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          return { success: false, error: error.message }
        }
      }
    }

    // Enviar webhook de forma assíncrona
    const webhookResult = await sendWebhookWithRetry(webhookUrl, webhookPayload)

    return new Response(
      JSON.stringify({
        message: 'Webhook processado',
        lead: webhookPayload,
        webhook_result: webhookResult
      }),
      { 
        status: webhookResult.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro no processamento:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})