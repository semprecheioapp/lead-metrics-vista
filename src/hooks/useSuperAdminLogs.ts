import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSuperAdminLogs = (empresaId?: number) => {
  return useQuery({
    queryKey: ["super_admin_logs", empresaId],
    queryFn: async () => {
      let agentQuery = supabase
        .from("logs_erros_agent")
        .select("*")
        .order("created_at", { ascending: false });

      let whatsappQuery = supabase
        .from("logs_erros_whatsapp")
        .select("*")
        .order("created_at", { ascending: false });

      // Se empresa específica for selecionada, filtrar
      if (empresaId) {
        agentQuery = agentQuery.eq("empresa_id", empresaId);
        whatsappQuery = whatsappQuery.eq("empresa_id", empresaId);
      }

      const [agentLogs, whatsappLogs] = await Promise.all([
        agentQuery,
        whatsappQuery
      ]);

      if (agentLogs.error) throw agentLogs.error;
      if (whatsappLogs.error) throw whatsappLogs.error;

      // Combinar e padronizar os logs
      const allLogs = [
        ...(agentLogs.data || []).map(log => ({
          ...log,
          type: 'agent',
          severity: 'error',
        })),
        ...(whatsappLogs.data || []).map(log => ({
          ...log,
          type: 'whatsapp',
          severity: 'error',
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const totalLogs = allLogs.length;
      const agentLogsCount = (agentLogs.data || []).length;
      const whatsappLogsCount = (whatsappLogs.data || []).length;
      const criticalErrors = allLogs.length;
      const warnings = 0;
      const infoLogs = 0;

      return {
        logs: allLogs,
        totalLogs,
        criticalErrors,
        warnings,
        infoLogs,
        agentLogs: agentLogsCount,
        whatsappLogs: whatsappLogsCount,
        recentLogs: allLogs.slice(0, 10)
      };
    },
    enabled: true
  });
};