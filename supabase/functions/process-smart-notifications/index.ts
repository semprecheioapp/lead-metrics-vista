import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface NotificationRule {
  tipo: 'lead_urgente' | 'followup_atrasado' | 'oportunidade' | 'meta_performance' | 'problema_critico';
  titulo: string;
  mensagem: string;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  dados_contexto?: any;
  empresa_id: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const processSmartNotifications = async () => {
  console.log('Iniciando processamento de notificações inteligentes...');

  try {
    // Buscar todas as empresas ativas
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, name_empresa')
      .eq('ativo', true);

    if (empresasError) {
      console.error('Erro ao buscar empresas:', empresasError);
      return;
    }

    console.log(`Processando ${empresas.length} empresas...`);

    for (const empresa of empresas) {
      console.log(`Processando empresa: ${empresa.name_empresa} (ID: ${empresa.id})`);
      
      // Verificar configurações de notificação da empresa
      const { data: config } = await supabase
        .from('configuracoes_notificacoes')
        .select('*')
        .eq('empresa_id', empresa.id)
        .maybeSingle();

      // Se não há configuração ou notificações estão desabilitadas, pular
      if (!config || !config.tipos_ativos?.dashboard) {
        console.log(`Notificações desabilitadas para empresa ${empresa.id}`);
        continue;
      }

      const notifications = await generateNotificationsForCompany(empresa.id, config);
      
      if (notifications.length > 0) {
        // Inserir notificações no banco
        const { error: insertError } = await supabase
          .from('notificacoes')
          .insert(notifications);

        if (insertError) {
          console.error(`Erro ao inserir notificações para empresa ${empresa.id}:`, insertError);
        } else {
          console.log(`${notifications.length} notificações criadas para empresa ${empresa.id}`);
        }
      }
    }

    console.log('Processamento de notificações concluído');
  } catch (error) {
    console.error('Erro no processamento de notificações:', error);
  }
};

const generateNotificationsForCompany = async (empresaId: number, config: any): Promise<NotificationRule[]> => {
  const notifications: NotificationRule[] = [];
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Verificar se já existe uma notificação similar hoje
  const { data: existingNotifications } = await supabase
    .from('notificacoes')
    .select('tipo')
    .eq('empresa_id', empresaId)
    .gte('created_at', new Date().toISOString().split('T')[0]);

  const existingTypes = existingNotifications?.map(n => n.tipo) || [];

  try {
    // 1. Leads Urgentes
    if (config.tipos_ativos?.lead_urgente && !existingTypes.includes('lead_urgente')) {
      const { data: urgentLeads } = await supabase
        .from('novos_leads')
        .select('id, name, created_at')
        .eq('empresa_id', empresaId)
        .eq('etapa', 1)
        .gte('created_at', thirtyMinutesAgo.toISOString());

      if (urgentLeads && urgentLeads.length > 0) {
        notifications.push({
          tipo: 'lead_urgente',
          titulo: `${urgentLeads.length} lead${urgentLeads.length > 1 ? 's' : ''} esperando resposta`,
          mensagem: `Você tem lead${urgentLeads.length > 1 ? 's' : ''} novo${urgentLeads.length > 1 ? 's' : ''} há mais de 30 minutos sem resposta.`,
          urgencia: 'alta',
          dados_contexto: { leads: urgentLeads.map(l => l.id) },
          empresa_id: empresaId
        });
      }
    }

    // 2. Follow-ups Atrasados
    if (config.tipos_ativos?.followup_atrasado && !existingTypes.includes('followup_atrasado')) {
      const { data: overdueLeads } = await supabase
        .from('novos_leads')
        .select('id, name, timeout')
        .eq('empresa_id', empresaId)
        .not('timeout', 'is', null)
        .lt('timeout', now.toISOString());

      if (overdueLeads && overdueLeads.length > 0) {
        notifications.push({
          tipo: 'followup_atrasado',
          titulo: `${overdueLeads.length} follow-up${overdueLeads.length > 1 ? 's' : ''} atrasado${overdueLeads.length > 1 ? 's' : ''}`,
          mensagem: `Você tem follow-up${overdueLeads.length > 1 ? 's' : ''} que já passou${overdueLeads.length > 1 ? 'ram' : 'ou'} do prazo.`,
          urgencia: 'alta',
          dados_contexto: { leads: overdueLeads.map(l => l.id) },
          empresa_id: empresaId
        });
      }
    }

    // 3. Oportunidades
    if (config.tipos_ativos?.oportunidade && !existingTypes.includes('oportunidade')) {
      const opportunityKeywords = ['preço', 'valor', 'custo', 'contratar', 'comprar', 'fechar', 'quando'];
      
      const { data: opportunityLeads } = await supabase
        .from('novos_leads')
        .select('id, name, resumo_conversa')
        .eq('empresa_id', empresaId)
        .not('resumo_conversa', 'is', null);

      const filteredOpportunities = opportunityLeads?.filter(lead => {
        if (!lead.resumo_conversa) return false;
        return opportunityKeywords.some(keyword => 
          lead.resumo_conversa.toLowerCase().includes(keyword)
        );
      }) || [];

      if (filteredOpportunities.length > 0) {
        notifications.push({
          tipo: 'oportunidade',
          titulo: `${filteredOpportunities.length} oportunidade${filteredOpportunities.length > 1 ? 's' : ''} detectada${filteredOpportunities.length > 1 ? 's' : ''}`,
          mensagem: `Lead${filteredOpportunities.length > 1 ? 's' : ''} demonstrando interesse comercial.`,
          urgencia: 'alta',
          dados_contexto: { leads: filteredOpportunities.map(l => l.id) },
          empresa_id: empresaId
        });
      }
    }

    // 4. Meta e Performance
    if (config.tipos_ativos?.meta_performance && !existingTypes.includes('meta_performance')) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      const { data: todayLeads } = await supabase
        .from('novos_leads')
        .select('id')
        .eq('empresa_id', empresaId)
        .gte('created_at', startOfToday.toISOString());

      const metaDiaria = 10; // Configurável
      if (todayLeads && todayLeads.length >= metaDiaria) {
        notifications.push({
          tipo: 'meta_performance',
          titulo: 'Meta diária atingida! 🎉',
          mensagem: `Parabéns! Você já captou ${todayLeads.length} leads hoje.`,
          urgencia: 'baixa',
          dados_contexto: { leads: todayLeads.length, meta: metaDiaria },
          empresa_id: empresaId
        });
      }
    }

    // 5. Problemas Críticos
    if (config.tipos_ativos?.problema_critico && !existingTypes.includes('problema_critico')) {
      const { data: unqualifiedLeads } = await supabase
        .from('novos_leads')
        .select('id')
        .eq('empresa_id', empresaId)
        .gt('etapa', 1)
        .or('qualificacao.is.null,qualificacao.eq.""');

      if (unqualifiedLeads && unqualifiedLeads.length > 5) {
        notifications.push({
          tipo: 'problema_critico',
          titulo: 'Muitos leads sem qualificação',
          mensagem: `${unqualifiedLeads.length} leads avançaram sem qualificação adequada.`,
          urgencia: 'critica',
          dados_contexto: { leads: unqualifiedLeads.map(l => l.id) },
          empresa_id: empresaId
        });
      }
    }

  } catch (error) {
    console.error(`Erro ao gerar notificações para empresa ${empresaId}:`, error);
  }

  return notifications;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Executar o processamento
    await processSmartNotifications();

    return new Response(
      JSON.stringify({ success: true, message: 'Notificações processadas com sucesso' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Erro na função process-smart-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});