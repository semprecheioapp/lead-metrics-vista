import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DateRange {
  from: Date;
  to: Date;
}

export const useSuperAdminControls = (selectedCompanyId?: number | null, dateRange?: DateRange) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === 'agenciambkautomacoes@gmail.com';

  const companyMetricsQuery = useQuery({
    queryKey: ["super_admin_company_metrics", selectedCompanyId, dateRange],
    queryFn: async () => {
      if (!isSuperAdmin) throw new Error("Acesso não autorizado");

      // Filtros de data
      const fromDate = dateRange?.from?.toISOString() || new Date(0).toISOString();
      const toDate = dateRange?.to?.toISOString() || new Date().toISOString();

      if (selectedCompanyId) {
        // Métricas específicas de uma empresa
        let memoriaQuery = supabase
          .from("memoria_ai")
          .select("session_id")
          .eq("empresa_id", selectedCompanyId)
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        let leadsQuery = supabase
          .from("novos_leads")
          .select("id, qualificacao")
          .eq("empresa_id", selectedCompanyId)
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        let logsAgentQuery = supabase
          .from("logs_erros_agent")
          .select("id")
          .eq("empresa_id", selectedCompanyId)
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        let logsWhatsappQuery = supabase
          .from("logs_erros_whatsapp")
          .select("id")
          .eq("empresa_id", selectedCompanyId)
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        const [memoriaData, leadsData, logsAgent, logsWhatsapp] = await Promise.all([
          memoriaQuery,
          leadsQuery,
          logsAgentQuery,
          logsWhatsappQuery
        ]);

        const totalSessions = new Set(memoriaData.data?.map(m => m.session_id).filter(Boolean)).size;
        const totalLeads = leadsData.data?.length || 0;
        const qualifiedLeads = leadsData.data?.filter(l => l.qualificacao === 'qualificado').length || 0;
        const totalLogs = (logsAgent.data?.length || 0) + (logsWhatsapp.data?.length || 0);

        return {
          totalSessions,
          totalLeads,
          qualifiedLeads,
          totalLogs,
          conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0
        };
      } else {
        // Métricas consolidadas de todas as empresas
        let memoriaQuery = supabase
          .from("memoria_ai")
          .select("session_id")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        let leadsQuery = supabase
          .from("novos_leads")
          .select("id, qualificacao")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        let logsAgentQuery = supabase
          .from("logs_erros_agent")
          .select("id")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        let logsWhatsappQuery = supabase
          .from("logs_erros_whatsapp")
          .select("id")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        const [memoriaData, leadsData, logsAgent, logsWhatsapp] = await Promise.all([
          memoriaQuery,
          leadsQuery,
          logsAgentQuery,
          logsWhatsappQuery
        ]);

        const totalSessions = new Set(memoriaData.data?.map(m => m.session_id).filter(Boolean)).size;
        const totalLeads = leadsData.data?.length || 0;
        const qualifiedLeads = leadsData.data?.filter(l => l.qualificacao === 'qualificado').length || 0;
        const totalLogs = (logsAgent.data?.length || 0) + (logsWhatsapp.data?.length || 0);

        return {
          totalSessions,
          totalLeads,
          qualifiedLeads,
          totalLogs,
          conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0
        };
      }
    },
    enabled: isSuperAdmin,
  });

  const companiesQuery = useQuery({
    queryKey: ["super_admin_companies"],
    queryFn: async () => {
      if (!isSuperAdmin) throw new Error("Acesso não autorizado");

      // Buscar todas as empresas com métricas básicas
      const { data: empresas, error: empresasError } = await supabase
        .from("empresas")
        .select("*")
        .order("created_at", { ascending: false });

      if (empresasError) throw empresasError;

      return {
        empresas: empresas || [],
        totalEmpresas: empresas?.length || 0,
        empresasAtivas: empresas?.filter(e => e.ativo).length || 0,
        empresasInativas: empresas?.filter(e => !e.ativo).length || 0
      };
    },
    enabled: isSuperAdmin,
  });

  return {
    companyMetrics: companyMetricsQuery.data,
    companyList: companiesQuery.data,
    isLoading: companyMetricsQuery.isLoading || companiesQuery.isLoading,
    isError: companyMetricsQuery.isError || companiesQuery.isError,
    error: companyMetricsQuery.error || companiesQuery.error
  };
};