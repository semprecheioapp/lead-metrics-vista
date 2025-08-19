
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLogsUnificados = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["logs_unificados", empresaId],
    queryFn: async () => {
      if (!empresaId) return {
        logs: [],
        totalLogs: 0,
        criticalErrors: 0,
        warnings: 0,
        infoLogs: 0,
        agentLogs: 0,
        whatsappLogs: 0,
        recentLogs: []
      };

      // Buscar logs do agent
      const { data: agentLogs, error: agentError } = await supabase
        .from("logs_erros_agent")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (agentError) throw agentError;

      // Buscar logs do whatsapp
      const { data: whatsappLogs, error: whatsappError } = await supabase
        .from("logs_erros_whatsapp")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (whatsappError) throw whatsappError;

      // Combinar e padronizar os logs
      const allLogs = [
        ...(agentLogs || []).map(log => ({
          ...log,
          type: 'agent',
          severity: 'error', // Assumindo que logs de erro são críticos
          message: log.description
        })),
        ...(whatsappLogs || []).map(log => ({
          ...log,
          type: 'whatsapp',
          severity: 'error', // Assumindo que logs de erro são críticos
          message: log.description
        }))
      ].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Mais recente primeiro
      });

      // Calcular estatísticas APENAS com dados reais
      const totalLogs = allLogs.length;
      const agentLogsCount = (agentLogs || []).length;
      const whatsappLogsCount = (whatsappLogs || []).length;
      
      // Só contar como erros críticos se realmente existem logs
      const criticalErrors = totalLogs > 0 ? allLogs.filter(log => 
        log.severity === 'error' || log.severity === 'critical'
      ).length : 0;
      
      // Como não temos campo de severity nos dados reais, warnings e info ficam zerados
      const warnings = 0;
      const infoLogs = 0;

      return {
        logs: allLogs,
        totalLogs,
        criticalErrors,
        warnings, // Sempre 0 até termos dados reais com severity
        infoLogs, // Sempre 0 até termos dados reais com severity
        agentLogs: agentLogsCount,
        whatsappLogs: whatsappLogsCount,
        recentLogs: allLogs.slice(0, 10)
      };
    },
    enabled: !!empresaId,
  });
};
