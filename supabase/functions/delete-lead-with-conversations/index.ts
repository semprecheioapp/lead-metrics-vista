import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeleteRequest {
  phone_number: string
  empresa_id: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { phone_number, empresa_id }: DeleteRequest = await req.json()

    if (!phone_number || !empresa_id) {
      throw new Error('Phone number and empresa_id are required')
    }

    // Verify user has access to this empresa
    const { data: userEmpresa, error: userEmpresaError } = await supabaseClient
      .from('users')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    if (userEmpresaError || !userEmpresa || userEmpresa.empresa_id !== empresa_id) {
      throw new Error('Unauthorized to delete from this empresa')
    }

    // Start transaction to delete from both tables
    
    // 1. Delete from novos_leads
    const { error: leadsError } = await supabaseClient
      .from('novos_leads')
      .delete()
      .eq('number', phone_number)
      .eq('empresa_id', empresa_id)

    if (leadsError) {
      console.error('Error deleting from novos_leads:', leadsError)
      throw new Error(`Failed to delete lead: ${leadsError.message}`)
    }

    // 2. Delete from memoria_ai
    const { error: memoriaError } = await supabaseClient
      .from('memoria_ai')
      .delete()
      .eq('session_id', phone_number)
      .eq('empresa_id', empresa_id)

    if (memoriaError) {
      console.error('Error deleting from memoria_ai:', memoriaError)
      throw new Error(`Failed to delete conversations: ${memoriaError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead and conversations deleted successfully',
        phone_number: phone_number 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in delete-lead-with-conversations:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})