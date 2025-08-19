import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const { token, user_id } = await req.json()

    if (!token) {
      throw new Error('Token é obrigatório')
    }

    // Buscar o convite
    const { data: invite, error: inviteError } = await supabaseClient
      .from('agent_invites')
      .select('id, email, company_id, role, expires_at, used')
      .eq('id', token)
      .single()

    if (inviteError || !invite) {
      throw new Error('Convite não encontrado')
    }

    if (invite.used) {
      throw new Error('Convite já foi utilizado')
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('Convite expirado')
    }

    // Buscar o usuário atual
    let userId = user_id;
    if (!user_id) {
      // Se não houver user_id, buscar pelo email do convite
      const { data: user, error: userError } = await supabaseClient
        .from('auth.users')
        .select('id')
        .eq('email', invite.email)
        .single()

      if (userError || !user) {
        throw new Error('Usuário não encontrado')
      }
      userId = user.id
    }

    // Marcar convite como usado
    await supabaseClient
      .from('agent_invites')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', token)

    // Adicionar usuário como agente da empresa
    const { error: agentError } = await supabaseClient
      .from('company_agents')
      .insert({
        company_id: invite.company_id,
        user_id: userId,
        role: invite.role || 'agent',
        created_at: new Date().toISOString()
      })

    if (agentError) {
      throw new Error('Erro ao adicionar usuário à empresa')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        company_name: invite.company_name,
        message: 'Convite aceito com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})