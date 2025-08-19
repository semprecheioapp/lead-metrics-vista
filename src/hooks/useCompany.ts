import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCompany = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["company", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;

      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", empresaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
};

export const useCompanyStats = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["company_stats", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;

      // Buscar estatísticas da empresa
      const [leadsResult, memoriaResult] = await Promise.all([
        supabase
          .from("novos_leads")
          .select("id, etapa, created_at")
          .eq("empresa_id", empresaId),
        supabase
          .from("memoria_ai")
          .select("id, session_id, created_at")
          .eq("empresa_id", empresaId)
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (memoriaResult.error) throw memoriaResult.error;

      const leads = leadsResult.data || [];
      const memoria = memoriaResult.data || [];

      // Calcular estatísticas
      const totalLeads = leads.length;
      const leadsHoje = leads.filter(lead => {
        const today = new Date().toDateString();
        const leadDate = new Date(lead.created_at || '').toDateString();
        return leadDate === today;
      }).length;

      const qualificados = leads.filter(lead => (lead.etapa || 1) >= 3).length;
      const fechados = leads.filter(lead => (lead.etapa || 1) === 4).length;

      const sessionsUnicas = new Set(memoria.map(m => m.session_id)).size;
      const mensagensHoje = memoria.filter(msg => {
        const today = new Date().toDateString();
        const msgDate = new Date(msg.created_at || '').toDateString();
        return msgDate === today;
      }).length;

      return {
        totalLeads,
        leadsHoje,
        qualificados,
        fechados,
        sessionsUnicas,
        mensagensHoje,
        taxaQualificacao: totalLeads > 0 ? Math.round((qualificados / totalLeads) * 100) : 0,
        taxaConversao: totalLeads > 0 ? Math.round((fechados / totalLeads) * 100) : 0,
      };
    },
    enabled: !!empresaId,
  });
};

export const useCompanyLimits = () => {
  const { empresaData } = useAuth();

  return {
    limiteLeads: empresaData?.limite_leads || 1000,
    limiteMensagens: empresaData?.limite_mensagens || 10000,
    plano: empresaData?.plano || 'free',
  };
};