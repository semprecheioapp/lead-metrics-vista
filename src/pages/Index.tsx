
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { FunnelChart } from "@/components/FunnelChart";
import { LeadsTableMobile } from "@/components/LeadsTableMobile";
import { ResponsiveLeadsTable } from "@/components/ResponsiveLeadsTable";
import { PerformanceChart } from "@/components/PerformanceChart";
import { ConversationAnalytics } from "@/components/ConversationAnalytics";
import { TrendAnalysisChart } from "@/components/TrendAnalysisChart";
import { LeadConversionAnalytics } from "@/components/LeadConversionAnalytics";
import { AIInsightsDashboard } from "@/components/AIInsightsDashboard";
import { Users, MessageSquare, CheckCircle, TrendingUp, Phone, Clock, Building, Zap, BarChart3, Target } from "lucide-react";
import { useMemoriaMetrics } from "@/hooks/useMemoriaMetrics";
import { useLeadsCountLast7Days } from "@/hooks/useLeads";
import { useLeadsKPIs } from "@/hooks/useLeadsStats";
import { useCompanyStats, useCompanyLimits } from "@/hooks/useCompany";
import { useAdvancedConversationMetrics, useAdvancedLeadMetrics, useCombinedMetrics } from "@/hooks/useAdvancedMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlurFade from "@/components/ui/blur-fade";

const Index = () => {
  const { empresaData, userProfile } = useAuth();
  const { data: memoriaData } = useMemoriaMetrics();
  const { data: leadsCount7d } = useLeadsCountLast7Days();
  const { data: leadsKpis } = useLeadsKPIs();
  const { data: companyStats } = useCompanyStats();
  const { limiteLeads, limiteMensagens, plano } = useCompanyLimits();
  const { data: advancedConversation } = useAdvancedConversationMetrics();
  const { data: advancedLeads } = useAdvancedLeadMetrics();
  const { data: combinedMetrics } = useCombinedMetrics();

  // Função para determinar se deve mostrar trend (apenas se há dados suficientes)
  const shouldShowTrend = (value: number) => value > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slide"></div>
                  <img 
                    src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                    alt="MBK" 
                    className="w-4 h-4 sm:w-6 sm:h-6 object-contain relative z-10"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent break-words">
                  {empresaData?.name_empresa || 'DashBoard_Mbk'}
                </h1>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span>Plano: <span className="capitalize font-medium text-primary">{plano}</span></span>
                    <span className="hidden sm:inline">|</span>
                    <span>Usuário: <span className="font-medium break-all">{userProfile?.nome || userProfile?.email}</span></span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Monitore o desempenho dos atendimentos em tempo real</p>
          </div>
        </BlurFade>

        {/* Dashboard com Abas */}
        <BlurFade delay={0.2}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex sm:grid w-full sm:grid-cols-5 bg-card/90 backdrop-blur-md border border-border/50 overflow-x-auto scrollbar-hide shadow-lg">
              <TabsTrigger value="overview" className="hover:scale-105 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 font-semibold">Visão Geral</TabsTrigger>
              <TabsTrigger value="conversations" className="hover:scale-105 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 font-semibold">Conversas</TabsTrigger>
              <TabsTrigger value="leads" className="hover:scale-105 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 font-semibold">Leads</TabsTrigger>
              <TabsTrigger value="trends" className="hover:scale-105 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 font-semibold">Tendências</TabsTrigger>
              <TabsTrigger value="ai-insights" className="hover:scale-105 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 font-semibold">IA & Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Métricas Principais */}
              <BlurFade delay={0.3}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              <MetricCard
                title="Total de Atendimentos"
                value={memoriaData?.totalSessions ?? 0}
                subtitle={`Limite: ${limiteMensagens.toLocaleString()}`}
                icon={<MessageSquare className="w-full h-full" strokeWidth={2} />}
                trend={shouldShowTrend(memoriaData?.totalSessions ?? 0) ? "up" : "neutral"}
                trendValue={shouldShowTrend(memoriaData?.totalSessions ?? 0) ? undefined : undefined}
              />
              <MetricCard
                title="Novos Leads"
                value={leadsCount7d ?? 0}
                subtitle={`Limite: ${limiteLeads.toLocaleString()}`}
                icon={<Users className="w-full h-full" strokeWidth={2} />}
                trend={shouldShowTrend(leadsCount7d ?? 0) ? "up" : "neutral"}
                trendValue={shouldShowTrend(leadsCount7d ?? 0) ? undefined : undefined}
              />
              <MetricCard
                title="Taxa de Qualificação"
                value={`${companyStats?.taxaQualificacao ?? 0}%`}
                subtitle="Leads qualificados"
                icon={<CheckCircle className="w-full h-full" strokeWidth={2} />}
                trend="up"
                trendValue={shouldShowTrend(companyStats?.taxaQualificacao ?? 0) ? `+${companyStats?.taxaQualificacao}%` : undefined}
              />
              <MetricCard
                title="Conversões"
                value={companyStats?.fechados ?? 0}
                subtitle={`Taxa: ${companyStats?.taxaConversao ?? 0}%`}
                icon={<TrendingUp className="w-full h-full" strokeWidth={2} />}
                trend="up"
                trendValue={shouldShowTrend(companyStats?.fechados ?? 0) ? `+${companyStats?.fechados}` : undefined}
              />
                </div>
              </BlurFade>

              {/* Métricas Avançadas */}
              <BlurFade delay={0.4}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              <MetricCard
                title="ROI por Cliente"
                value={`R$ ${combinedMetrics?.roiPerCustomer || 0}`}
                icon={<Zap className="w-full h-full" strokeWidth={2} />}
                trend="neutral"
              />
              
              <MetricCard
                title="Score Qualidade"
                value={`${combinedMetrics?.qualityScore || 0}%`}
                icon={<BarChart3 className="w-full h-full" strokeWidth={2} />}
                trend="neutral"
              />
              
              <MetricCard
                title="Predição"
                value={combinedMetrics?.predictedConversions || 0}
                subtitle="conversões est."
                icon={<Target className="w-full h-full" strokeWidth={2} />}
                trend="neutral"
              />
              
              <MetricCard
                title="Taxa Abandono"
                value={`${advancedConversation?.abandonmentRate || 0}%`}
                icon={<Clock className="w-full h-full" strokeWidth={2} />}
                trend="down"
              />
                </div>
              </BlurFade>

              {/* Gráficos Principais */}
              <BlurFade delay={0.5}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <FunnelChart />
                  <PerformanceChart />
                </div>
              </BlurFade>

              {/* Tabela de Leads Responsiva */}
              <BlurFade delay={0.6}>
                <ResponsiveLeadsTable />
              </BlurFade>
            </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <ConversationAnalytics />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <LeadConversionAnalytics />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendAnalysisChart />
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <AIInsightsDashboard />
          </TabsContent>
          </Tabs>
        </BlurFade>
      </div>
    </DashboardLayout>
  );
};

export default Index;
