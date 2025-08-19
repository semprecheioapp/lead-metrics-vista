import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type LeadRow = {
  id: number;
  name: string | null;
  number: string | null;
  etapa: number | null;
  qualificacao: string | null;
  created_at: string | null;
  tags: string[] | null;
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

export const useRecentLeads = (limit = 10) => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["novos_leads", "recent", limit, empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from("novos_leads")
        .select("id,name,number,etapa,qualificacao,created_at,tags")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const rows = (data || []) as LeadRow[];
      return rows.map((r) => ({
        id: r.id,
        name: r.name ?? "Sem nome",
        phone: r.number ?? "-",
        stage: mapEtapaToStage(r.etapa),
        qualification: r.qualificacao ?? "-",
        created_at: r.created_at,
        tags: Array.isArray(r.tags) ? r.tags : [],
      }));
    },
    enabled: !!empresaId,
  });
};

export const useLeadsCountLast7Days = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["novos_leads", "count7d", empresaId],
    queryFn: async () => {
      if (!empresaId) return 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count, error } = await supabase
        .from("novos_leads")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .gte("created_at", sevenDaysAgo.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!empresaId,
  });
};
