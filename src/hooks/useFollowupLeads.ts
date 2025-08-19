import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FollowupLead = {
  id: number;
  name: string;
  number: string;
  etapa: number;
  qualificacao: string;
  created_at: string;
  updated_at: string;
  dias_parado: number;
  stage: string;
};

const mapEtapaToStage = (etapa?: number | null) => {
  switch (etapa) {
    case 1:
      return "Novo";
    case 2:
      return "Abordado";
    case 3:
      return "Qualificado";
    case 4:
      return "Fechado";
    default:
      return "Novo";
  }
};

const calculateDaysStuck = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const useFollowupLeads = (minDaysStuck = 3) => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["followup_leads", empresaId, minDaysStuck],
    queryFn: async () => {
      if (!empresaId) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - minDaysStuck);

      console.log('Buscando leads abandonados por created_at:', {
        empresaId,
        minDaysStuck,
        cutoffDate: cutoffDate.toISOString()
      });

      const { data, error } = await supabase
        .from("novos_leads")
        .select("id,name,number,etapa,qualificacao,created_at,updated_at")
        .eq("empresa_id", empresaId)
        .in("etapa", [2, 3]) // Abordado e Qualificado
        .lte("created_at", cutoffDate.toISOString()) // Usar created_at em vez de updated_at
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Erro ao buscar leads de follow-up:', error);
        throw error;
      }

      console.log('Leads encontrados:', data);

      return (data || []).map((lead) => ({
        ...lead,
        name: lead.name ?? "Sem nome",
        number: lead.number ?? "-",
        qualificacao: lead.qualificacao ?? "-",
        dias_parado: calculateDaysStuck(lead.created_at), // Usar created_at
        stage: mapEtapaToStage(lead.etapa),
      })) as FollowupLead[];
    },
    enabled: !!empresaId,
  });
};

export const useFollowupMetrics = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["followup_metrics", empresaId],
    queryFn: async () => {
      if (!empresaId) return {
        totalAbandoned: 0,
        averageDaysStuck: 0,
        byStage: { abordado: 0, qualificado: 0 }
      };

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 3);

      const { data, error } = await supabase
        .from("novos_leads")
        .select("etapa,created_at") // Usar created_at em vez de updated_at
        .eq("empresa_id", empresaId)
        .in("etapa", [2, 3])
        .lte("created_at", cutoffDate.toISOString()); // Usar created_at

      if (error) throw error;

      const leads = data || [];
      const totalAbandoned = leads.length;
      
      const totalDays = leads.reduce((sum, lead) => {
        return sum + calculateDaysStuck(lead.created_at); // Usar created_at
      }, 0);
      
      const averageDaysStuck = totalAbandoned > 0 ? Math.round(totalDays / totalAbandoned) : 0;
      
      const byStage = {
        abordado: leads.filter(l => l.etapa === 2).length,
        qualificado: leads.filter(l => l.etapa === 3).length
      };

      return {
        totalAbandoned,
        averageDaysStuck,
        byStage
      };
    },
    enabled: !!empresaId,
  });
};