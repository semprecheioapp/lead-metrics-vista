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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const { token } = await req.json()

    if (!token) {
      throw new Error('Token é obrigatório')
    }

    // Validar formato do token
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
      throw new Error('Formato de token inválido')
    }

    // Buscar o convite com segurança
    const { data: invite, error } = await supabaseClient
      .from('agent_invites')
      .select('id, email, company_id, role, expires_at, used')
      .eq('id', token)
      .single()

    if (error || !invite) {
      throw new Error('Convite não encontrado ou inválido')
    }

    if (invite.used) {
      throw new Error('Convite já foi utilizado')
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('Convite expirado')
    }

    return new Response(
      JSON.stringify({ 
        email: invite.email,
        company_name: invite.company_name,
        valid: true,
        token: token
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