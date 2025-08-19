import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevokeRequest {
  invite_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? '',
          },
        },
      }
    );


    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Get user profile to find company
    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    if (!profile?.empresa_id) {
      throw new Error('Empresa não encontrada');
    }

    const { invite_id }: RevokeRequest = await req.json();

    if (!invite_id) {
      throw new Error('ID do convite é obrigatório');
    }

    // Find and revoke the invite
    const { data: invite, error: findError } = await supabase
      .from('convites_empresa')
      .select('*')
      .eq('id', invite_id)
      .eq('company_id', profile.empresa_id)
      .eq('status', 'pending')
      .single();

    if (findError || !invite) {
      throw new Error('Convite não encontrado ou já processado');
    }

    // Revoke the invite
    const { error: revokeError } = await supabase
      .from('convites_empresa')
      .update({ status: 'revoked' })
      .eq('id', invite_id);

    if (revokeError) {
      console.error('Error revoking invite:', revokeError);
      throw new Error('Erro ao revogar convite');
    }

    // Log audit
    await supabase.rpc('audit_log', {
      actor_id: user.id,
      company_uuid: profile.empresa_id,
      action_name: 'agent_invite_revoked',
      target_type_name: 'convite_empresa',
      target_uuid: invite.id,
      metadata_json: { email: invite.email }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Convite revogado com sucesso' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in agent-invite-revoke:', error);
    return new Response(
      JSON.stringify({ error: (error as any).message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);