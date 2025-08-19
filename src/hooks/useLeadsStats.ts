import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FunnelCounts = {
  novo: number;
  abordado: number;
  qualificado: number;
  fechado: number;
};

export const useLeadsFunnel = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["novos_leads", "funnel", empresaId],
    queryFn: async () => {
      if (!empresaId) return { novo: 0, abordado: 0, qualificado: 0, fechado: 0 };

      const { data, error } = await supabase
        .from("novos_leads")
        .select("etapa")
        .eq("empresa_id", empresaId)
        .limit(5000);
      if (error) throw error;
      const counts: FunnelCounts = { novo: 0, abordado: 0, qualificado: 0, fechado: 0 };
      (data || []).forEach((r: { etapa: number | null }) => {
        switch (r.etapa ?? 1) {
          case 1: counts.novo++; break;
          case 2: counts.abordado++; break;
          case 3: counts.qualificado++; break;
          case 4: counts.fechado++; break;
          default: counts.novo++; break;
        }
      });
      return counts;
    },
    enabled: !!empresaId,
  });
};

export const useLeadsKPIs = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["novos_leads", "kpis", empresaId],
    queryFn: async () => {
      if (!empresaId) return { total: 0, qualificados: 0, fechados: 0, qualRate: 0 };

      const { data, error } = await supabase
        .from("novos_leads")
        .select("etapa")
        .eq("empresa_id", empresaId)
        .limit(5000);
      if (error) throw error;
      const total = data?.length ?? 0;
      const qualificados = (data || []).filter(r => (r.etapa ?? 1) >= 3).length;
      const fechados = (data || []).filter(r => (r.etapa ?? 1) === 4).length;
      const qualRate = total > 0 ? Math.round((qualificados / total) * 100) : 0;
      return {
        total,
        qualificados,
        fechados,
        qualRate,
      };
    },
    enabled: !!empresaId,
  });
};
