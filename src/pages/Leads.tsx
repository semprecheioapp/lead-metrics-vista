
import { DashboardLayout } from "@/components/DashboardLayout";
import { LazyAllLeadsTable } from "@/components/LazyComponent";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Download, Plus, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useCompanyStats } from "@/hooks/useCompany";
import { PageTransition } from "@/components/PageTransition";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  
  const { data: statsData, isLoading } = useCompanyStats();

  // Verificar se há dados suficientes para mostrar tendências
  const hasLeadsData = statsData?.totalLeads && statsData.totalLeads > 0;

  const leadMetrics = [
    {
      title: "Total de Leads",
      value: statsData?.totalLeads || 0,
      subtitle: "Todos os períodos",
      icon: <Users strokeWidth={2} />,
      trend: hasLeadsData ? "up" as const : undefined,
      trendValue: hasLeadsData ? "+12%" : undefined
    },
    {
      title: "Leads Hoje",
      value: statsData?.leadsHoje || 0,
      subtitle: "Últimas 24 horas",
      icon: <TrendingUp strokeWidth={2} />,
      trend: (statsData?.leadsHoje || 0) > 0 ? "up" as const : undefined,
      trendValue: (statsData?.leadsHoje || 0) > 0 ? "+5%" : undefined
    },
    {
      title: "Qualificados",
      value: statsData?.qualificados || 0,
      subtitle: "Taxa atual",
      icon: <CheckCircle strokeWidth={2} />,
      trend: (statsData?.qualificados || 0) > 0 ? "up" as const : undefined,
      trendValue: (statsData?.qualificados || 0) > 0 ? "+8%" : undefined
    },
    {
      title: "Convertidos",
      value: statsData?.fechados || 0,
      subtitle: "Este mês",
      icon: <Clock strokeWidth={2} />,
      trend: (statsData?.fechados || 0) > 0 ? "up" as const : undefined,
      trendValue: (statsData?.fechados || 0) > 0 ? "+15%" : undefined
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
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Leads</h1>
              <p className="text-muted-foreground">Acompanhe e gerencie todos os seus leads em um só lugar</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-primary/40 hover:bg-primary/10">
                <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                Exportar
              </Button>
              <Button variant="corporate">
                <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
                Novo Lead
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {leadMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                icon={metric.icon}
                trend={metric.trend}
                trendValue={metric.trendValue}
                className="hover:shadow-corporate-glow/40 transition-all duration-300"
              />
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
                    <Input
                      placeholder="Buscar por nome, telefone ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="qualificado">Qualificado</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={originFilter} onValueChange={setOriginFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Origens</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-primary/40 hover:bg-primary/10">
                  <Filter className="w-4 h-4 mr-2" strokeWidth={2} />
                  Filtros Avançados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyAllLeadsTable />
            </CardContent>
          </Card>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
