
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarIcon, BarChart3, MessageSquare, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useMemoriaMetrics } from "@/hooks/useMemoriaMetrics";
import { useCompanyStats } from "@/hooks/useCompany";

export default function Metricas() {
  const [period, setPeriod] = useState("7d");
  const { data: memoriaData, isLoading: memoriaLoading } = useMemoriaMetrics();
  const { data: statsData, isLoading: statsLoading } = useCompanyStats();

  const isLoading = memoriaLoading || statsLoading;

  // Verificar se há dados suficientes para mostrar tendências
  const hasMemoriaData = memoriaData?.totalMessages && memoriaData.totalMessages > 0;
  const hasStatsData = statsData?.totalLeads && statsData.totalLeads > 0;
  const hasEnoughData = hasMemoriaData || hasStatsData;

  const metrics = [
    {
      title: "Total de Atendimentos",
      value: memoriaData?.totalSessions || 0,
      subtitle: "Últimos 7 dias",
      icon: <MessageSquare className="w-5 h-5 text-primary" />,
      trend: hasMemoriaData ? "up" as const : undefined,
      trendValue: hasMemoriaData ? "+12%" : undefined
    },
    {
      title: "Leads Qualificados",
      value: statsData?.qualificados || 0,
      subtitle: "Este mês",
      icon: <Users className="w-5 h-5 text-primary" />,
      trend: hasStatsData && (statsData?.qualificados || 0) > 0 ? "up" as const : undefined,
      trendValue: hasStatsData && (statsData?.qualificados || 0) > 0 ? "+8%" : undefined
    },
    {
      title: "Taxa de Conversão",
      value: `${statsData?.taxaConversao || 0}%`,
      subtitle: "Média mensal",
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      trend: hasStatsData && (statsData?.taxaConversao || 0) > 0 ? "up" as const : undefined,
      trendValue: hasStatsData && (statsData?.taxaConversao || 0) > 0 ? "+5%" : undefined
    },
    {
      title: "Tempo Médio de Resposta",
      value: memoriaData?.responseTimeAverage ? `${memoriaData.responseTimeAverage}min` : "0min",
      subtitle: "Últimos 30 dias",
      icon: <Clock className="w-5 h-5 text-primary" />,
      trend: memoriaData?.responseTimeAverage ? "down" as const : undefined,
      trendValue: memoriaData?.responseTimeAverage ? "-15%" : undefined
    },
    {
      title: "Leads Convertidos",
      value: statsData?.fechados || 0,
      subtitle: "Este mês",
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
      trend: hasStatsData && (statsData?.fechados || 0) > 0 ? "up" as const : undefined,
      trendValue: hasStatsData && (statsData?.fechados || 0) > 0 ? "+18%" : undefined
    },
    {
      title: "Sessões Únicas",
      value: memoriaData?.totalSessions || 0,
      subtitle: "Últimos 7 dias",
      icon: <BarChart3 className="w-5 h-5 text-primary" />,
      trend: undefined,
      trendValue: undefined
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Métricas Detalhadas</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho do seu atendimento em tempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Personalizar Período
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              trend={metric.trend}
              trendValue={metric.trendValue}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensagens por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {hasMemoriaData ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de mensagens será implementado</p>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem para exibir</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData?.totalLeads || 0}</div>
                <div className="text-sm text-muted-foreground">Total de Leads</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData?.leadsHoje || 0}</div>
                <div className="text-sm text-muted-foreground">Leads Hoje</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData?.mensagensHoje || 0}</div>
                <div className="text-sm text-muted-foreground">Mensagens Hoje</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{statsData?.sessionsUnicas || 0}</div>
                <div className="text-sm text-muted-foreground">Sessões Únicas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
