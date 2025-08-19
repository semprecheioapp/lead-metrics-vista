import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cacheKeys, invalidateCache } from "@/lib/cache";

export type LeadRow = {
  id: number;
  name: string | null;
  number: string | null;
  etapa: number | null;
  qualificacao: string | null;
  created_at: string | null;
  tags: string[] | null;
};

// Utility to map stage
const mapEtapaToStage = (etapa?: number | null) => {
  const stages = {
    1: "Novo",
    2: "Abordado", 
    3: "Qualificado",
    4: "Fechado"
  };
  return stages[etapa as keyof typeof stages] || "Novo";
};

// Optimized query with pagination and filtering
export const useLeadsOptimized = (options?: {
  page?: number;
  limit?: number;
  search?: string;
  stage?: number;
  dateRange?: { start: string; end: string };
}) => {
  const { empresaId } = useAuth();
  const { page = 1, limit = 50, search, stage, dateRange } = options || {};

  return useQuery({
    queryKey: cacheKeys.leads.all(empresaId || ""),
    queryFn: async () => {
      if (!empresaId) return [];

      let query = supabase
        .from("novos_leads")
        .select("id,name,number,etapa,qualificacao,created_at,tags", { count: "exact" })
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,number.ilike.%${search}%`);
      }
      if (stage) {
        query = query.eq("etapa", stage);
      }
      if (dateRange) {
        query = query
          .gte("created_at", dateRange.start)
          .lte("created_at", dateRange.end);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        leads: (data || []).map((r) => ({
          id: r.id,
          name: r.name ?? "Sem nome",
          phone: r.number ?? "-",
          stage: mapEtapaToStage(r.etapa),
          qualification: r.qualificacao ?? "-",
          created_at: r.created_at,
          tags: Array.isArray(r.tags) ? r.tags : [],
        })),
        total: count || 0,
        page,
        limit,
      };
    },
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimized recent leads with smaller payload
export const useRecentLeadsOptimized = (limit = 10) => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: cacheKeys.leads.recent(empresaId || "", limit),
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from("novos_leads")
        .select("id,name,number,etapa,created_at")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((r) => ({
        id: r.id,
        name: r.name ?? "Sem nome",
        phone: r.number ?? "-",
        stage: mapEtapaToStage(r.etapa),
        created_at: r.created_at,
      }));
    },
    enabled: !!empresaId,
    staleTime: 2 * 60 * 1000, // 2 minutes for frequent updates
  });
};

// Optimized count with proper date handling
export const useLeadsCountOptimized = (period: '7d' | '30d' | 'all' = '7d') => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: cacheKeys.leads.count(empresaId || "", period),
    queryFn: async () => {
      if (!empresaId) return 0;

      let query = supabase
        .from("novos_leads")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId);

      if (period !== 'all') {
        const days = period === '7d' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte("created_at", startDate.toISOString());
      }

      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!empresaId,
    staleTime: 10 * 60 * 1000, // 10 minutes for counts
  });
};

// Mutation for bulk operations
export const useBulkUpdateLeads = () => {
  const queryClient = useQueryClient();
  const { empresaId } = useAuth();

  return useMutation({
    mutationFn: async ({
      leadIds,
      updateData,
    }: {
      leadIds: number[];
      updateData: Partial<LeadRow>;
    }) => {
      const { error } = await supabase
        .from("novos_leads")
        .update(updateData)
        .in("id", leadIds);

      if (error) throw error;
      return leadIds;
    },
    onSuccess: () => {
      // Invalidate all lead caches
      invalidateCache(cacheKeys.leads.all(empresaId || ""));
      invalidateCache(cacheKeys.leads.recent(empresaId || ""));
      invalidateCache(cacheKeys.leads.count(empresaId || "", "7d"));
      invalidateCache(cacheKeys.leads.count(empresaId || "", "30d"));
    },
  });
};