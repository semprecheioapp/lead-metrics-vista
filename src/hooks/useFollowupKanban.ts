import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FollowupKanbanLead {
  id: number;
  name: string;
  number: string;
  etapa: number;
  qualificacao: string;
  dias_parado: number;
  stage: string;
  created_at: string;
  updated_at: string;
  followup_count: number;
  ultimo_followup: string | null;
}

const mapEtapaToStage = (etapa?: number | null): string => {
  switch (etapa) {
    case 1:
      return "Interessado";
    case 2:
      return "Abordado";
    case 3:
      return "Qualificado";
    case 4:
      return "Convertido";
    default:
      return "Desconhecido";
  }
};

const calculateDaysStuck = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateTimeStuck = (createdAt: string, unit: 'minutes' | 'hours' | 'days' = 'days') => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  
  switch (unit) {
    case 'minutes':
      return Math.floor(diffTime / (1000 * 60));
    case 'hours':
      return Math.floor(diffTime / (1000 * 60 * 60));
    case 'days':
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    default:
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

export interface FollowupFilter {
  value: number;
  unit: 'minutes' | 'hours' | 'days';
}

export const useFollowupKanban = (filter: FollowupFilter = { value: 3, unit: 'days' }) => {
  const { empresaData } = useAuth();
  const empresaId = empresaData?.id;

  return useQuery({
    queryKey: ["followup_kanban", empresaId, filter],
    queryFn: async () => {
      if (!empresaId) {
        throw new Error("Company ID is required");
      }

      const cutoffDate = new Date();
      
      // Calcular a data de corte baseada na unidade
      switch (filter.unit) {
        case 'minutes':
          cutoffDate.setMinutes(cutoffDate.getMinutes() - filter.value);
          break;
        case 'hours':
          cutoffDate.setHours(cutoffDate.getHours() - filter.value);
          break;
        case 'days':
          cutoffDate.setDate(cutoffDate.getDate() - filter.value);
          break;
      }

      console.log('Buscando leads para kanban:', {
        empresaId,
        filter,
        cutoffDate: cutoffDate.toISOString()
      });

      const { data, error } = await supabase
        .from("novos_leads")
        .select("id,name,number,etapa,qualificacao,created_at,updated_at,followup_count,ultimo_followup")
        .eq("empresa_id", empresaId)
        .in("etapa", [2, 3]) // Abordado e Qualificado
        .lte("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Erro ao buscar leads para kanban:', error);
        throw error;
      }

      console.log('Leads encontrados para kanban:', {
        total: data?.length || 0,
        leads: data
      });

      const allLeads = (data || []).map(lead => ({
        id: lead.id,
        name: lead.name ?? "Sem nome",
        number: lead.number ?? "-",
        qualificacao: lead.qualificacao ?? "-",
        dias_parado: calculateDaysStuck(lead.created_at),
        stage: mapEtapaToStage(lead.etapa),
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        followup_count: lead.followup_count || 0,
        ultimo_followup: lead.ultimo_followup,
        etapa: lead.etapa || 0,
      })) as FollowupKanbanLead[];

      // Separar leads por status de follow-up
      const pendingLeads = allLeads.filter(lead => lead.followup_count === 0);
      const sentOnceLeads = allLeads.filter(lead => lead.followup_count === 1);
      const sentMultipleLeads = allLeads.filter(lead => lead.followup_count > 1);

      return {
        pending: pendingLeads,
        sentOnce: sentOnceLeads,
        sentMultiple: sentMultipleLeads,
        total: allLeads.length,
        totalPending: pendingLeads.length,
        totalSentOnce: sentOnceLeads.length,
        totalSentMultiple: sentMultipleLeads.length
      };
    },
    enabled: !!empresaId,
  });
};