import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useFollowupLeads } from "./useFollowupLeads";
import { useAgendamentos } from "./useAgendamentos";
import { subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

export const useSmartNotifications = () => {
  const { data: empresa } = useCompany();
  const { data: followupLeads = [] } = useFollowupLeads();
  const { data: agendamentos = [] } = useAgendamentos();

  const generateNotifications = async () => {
    if (!empresa?.id) return [];

    const notifications = [];
    const now = new Date();
    const oneDayAgo = subDays(now, 1);
    const oneWeekAgo = subDays(now, 7);

    // Buscar leads diretamente do banco
    const { data: leads = [] } = await supabase
      .from('novos_leads')
      .select('*')
      .eq('empresa_id', empresa.id);

    // 1. Leads Urgentes - Novos leads sem resposta há mais de 30 min
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const urgentLeads = leads.filter(lead => {
      const createdAt = new Date(lead.created_at);
      return isAfter(createdAt, thirtyMinutesAgo) && lead.etapa === 1; // Assumindo etapa 1 = sem contato
    });

    if (urgentLeads.length > 0) {
      notifications.push({
        tipo: 'lead_urgente' as const,
        titulo: `${urgentLeads.length} lead${urgentLeads.length > 1 ? 's' : ''} esperando resposta`,
        mensagem: `Você tem lead${urgentLeads.length > 1 ? 's' : ''} novo${urgentLeads.length > 1 ? 's' : ''} há mais de 30 minutos sem resposta.`,
        urgencia: 'alta' as const,
        dados_contexto: { leads: urgentLeads.map(l => l.id) }
      });
    }

    // 2. Leads com palavras-chave urgentes
    const hotKeywords = ['urgente', 'hoje', 'agora', 'rápido', 'imediato'];
    const hotLeads = leads.filter(lead => {
      if (!lead.resumo_conversa) return false;
      return hotKeywords.some(keyword => 
        lead.resumo_conversa.toLowerCase().includes(keyword)
      );
    });

    if (hotLeads.length > 0) {
      notifications.push({
        tipo: 'lead_urgente' as const,
        titulo: `${hotLeads.length} lead${hotLeads.length > 1 ? 's' : ''} com urgência detectada`,
        mensagem: `Lead${hotLeads.length > 1 ? 's' : ''} com palavras de urgência na conversa.`,
        urgencia: 'critica' as const,
        dados_contexto: { leads: hotLeads.map(l => l.id) }
      });
    }

    // 3. Follow-ups Atrasados
    const overdueFollowups = leads.filter(lead => {
      if (!lead.timeout) return false;
      const timeoutDate = new Date(lead.timeout);
      return isBefore(timeoutDate, now);
    });

    if (overdueFollowups.length > 0) {
      notifications.push({
        tipo: 'followup_atrasado' as const,
        titulo: `${overdueFollowups.length} follow-up${overdueFollowups.length > 1 ? 's' : ''} atrasado${overdueFollowups.length > 1 ? 's' : ''}`,
        mensagem: `Você tem follow-up${overdueFollowups.length > 1 ? 's' : ''} que já passou${overdueFollowups.length > 1 ? 'ram' : 'ou'} do prazo.`,
        urgencia: 'alta' as const,
        dados_contexto: { leads: overdueFollowups.map(l => l.id) }
      });
    }

    // 4. Leads sem contato há mais de 7 dias
    const abandonedLeads = leads.filter(lead => {
      const createdAt = new Date(lead.created_at);
      return isBefore(createdAt, oneWeekAgo) && lead.etapa === 1;
    });

    if (abandonedLeads.length > 0) {
      notifications.push({
        tipo: 'followup_atrasado' as const,
        titulo: `${abandonedLeads.length} lead${abandonedLeads.length > 1 ? 's' : ''} abandonado${abandonedLeads.length > 1 ? 's' : ''}`,
        mensagem: `Lead${abandonedLeads.length > 1 ? 's' : ''} sem contato há mais de 7 dias.`,
        urgencia: 'media' as const,
        dados_contexto: { leads: abandonedLeads.map(l => l.id) }
      });
    }

    // 5. Agendamentos perdidos sem reagendamento
    const missedAppointments = agendamentos.filter(agendamento => {
      if (!agendamento.data || !agendamento.hora) return false;
      const appointmentDate = new Date(`${agendamento.data} ${agendamento.hora}`);
      return isBefore(appointmentDate, now) && !agendamento.compareceu && agendamento.status;
    });

    if (missedAppointments.length > 0) {
      notifications.push({
        tipo: 'followup_atrasado' as const,
        titulo: `${missedAppointments.length} agendamento${missedAppointments.length > 1 ? 's' : ''} perdido${missedAppointments.length > 1 ? 's' : ''}`,
        mensagem: `Agendamento${missedAppointments.length > 1 ? 's' : ''} não compareceu${missedAppointments.length > 1 ? 'ram' : ''} e não foi${missedAppointments.length > 1 ? 'ram' : ''} reagendado${missedAppointments.length > 1 ? 's' : ''}.`,
        urgencia: 'alta' as const,
        dados_contexto: { agendamentos: missedAppointments.map(a => a.id) }
      });
    }

    // 6. Oportunidades detectadas
    const opportunityKeywords = ['preço', 'valor', 'custo', 'contratar', 'comprar', 'fechar', 'quando'];
    const opportunityLeads = leads.filter(lead => {
      if (!lead.resumo_conversa) return false;
      return opportunityKeywords.some(keyword => 
        lead.resumo_conversa.toLowerCase().includes(keyword)
      );
    });

    if (opportunityLeads.length > 0) {
      notifications.push({
        tipo: 'oportunidade' as const,
        titulo: `${opportunityLeads.length} oportunidade${opportunityLeads.length > 1 ? 's' : ''} detectada${opportunityLeads.length > 1 ? 's' : ''}`,
        mensagem: `Lead${opportunityLeads.length > 1 ? 's' : ''} demonstrando interesse comercial.`,
        urgencia: 'alta' as const,
        dados_contexto: { leads: opportunityLeads.map(l => l.id) }
      });
    }

    // 7. Performance e Metas
    const todayLeads = leads.filter(lead => {
      const createdAt = new Date(lead.created_at);
      return isAfter(createdAt, startOfDay(now)) && isBefore(createdAt, endOfDay(now));
    });

    const yesterdayLeads = leads.filter(lead => {
      const createdAt = new Date(lead.created_at);
      return isAfter(createdAt, startOfDay(oneDayAgo)) && isBefore(createdAt, endOfDay(oneDayAgo));
    });

    // Alerta se houve queda significativa nos leads
    if (yesterdayLeads.length > 0 && todayLeads.length < yesterdayLeads.length * 0.5) {
      notifications.push({
        tipo: 'meta_performance' as const,
        titulo: 'Queda no volume de leads',
        mensagem: `Volume de leads hoje (${todayLeads.length}) está 50% menor que ontem (${yesterdayLeads.length}).`,
        urgencia: 'media' as const,
        dados_contexto: { hoje: todayLeads.length, ontem: yesterdayLeads.length }
      });
    }

    // Meta de leads atingida (exemplo: 10 leads por dia)
    const metaDiaria = 10;
    if (todayLeads.length >= metaDiaria) {
      notifications.push({
        tipo: 'meta_performance' as const,
        titulo: 'Meta diária atingida! 🎉',
        mensagem: `Parabéns! Você já captou ${todayLeads.length} leads hoje.`,
        urgencia: 'baixa' as const,
        dados_contexto: { leads: todayLeads.length, meta: metaDiaria }
      });
    }

    // 8. Problemas Críticos
    const leadsUnqualified = leads.filter(lead => !lead.qualificacao && lead.etapa > 1);
    if (leadsUnqualified.length > 5) {
      notifications.push({
        tipo: 'problema_critico' as const,
        titulo: 'Muitos leads sem qualificação',
        mensagem: `${leadsUnqualified.length} leads avançaram sem qualificação adequada.`,
        urgencia: 'critica' as const,
        dados_contexto: { leads: leadsUnqualified.map(l => l.id) }
      });
    }

    return notifications;
  };

  return useQuery({
    queryKey: ['smart-notifications', empresa?.id],
    queryFn: generateNotifications,
    enabled: !!empresa?.id,
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
};