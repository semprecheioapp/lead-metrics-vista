import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { 
      companyName, 
      employees, 
      email, 
      phone, 
      monthlyContacts, 
      hasAI, 
      objectives, 
      segment, 
      urgent, 
      notes 
    } = await req.json();

    console.log('Processing landing page qualification form:', {
      companyName,
      email,
      phone,
      hasAI,
      urgent
    });

    // Save lead to database
    const { data, error } = await supabase
      .from('novos_leads')
      .insert({
        name: companyName,
        number: phone,
        email: email,
        etapa: 'Novo',
        qualificacao: hasAI ? 'Tem IA - Quer otimizar' : 'Não tem IA - Quer implementar',
        origem: 'landing_page',
        tags: objectives || [],
        observacoes: JSON.stringify({
          employees,
          monthlyContacts,
          hasAI,
          objectives,
          segment,
          urgent,
          notes,
          source: 'qualification_form'
        }),
        empresa_id: 1 // Default para leads da landing page
      });

    if (error) {
      console.error('Error saving lead:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save lead' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create notification for admin
    await supabase
      .from('notificacoes')
      .insert({
        titulo: `Novo Lead da Landing Page: ${companyName}`,
        mensagem: `Lead qualificado via formulário da landing page. ${urgent ? '🔥 URGENTE' : ''}`,
        tipo: 'lead_qualificado',
        empresa_id: 1,
        metadata: {
          leadId: data[0]?.id,
          source: 'landing_page',
          urgent: urgent,
          hasAI: hasAI
        }
      });

    console.log('Lead saved successfully:', data[0]?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: data[0]?.id,
        message: 'Lead qualificado com sucesso!'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing qualification form:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});