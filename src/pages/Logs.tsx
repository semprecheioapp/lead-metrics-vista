import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Search, Filter, Download, Eye, AlertCircle, Info, XCircle } from "lucide-react";
import { useState } from "react";
import { useSuperAdminLogs } from "@/hooks/useSuperAdminLogs";
import { useAllEmpresas } from "@/hooks/useAllEmpresas";

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7d");
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | undefined>(undefined);
  
  const { data: logsData, isLoading } = useSuperAdminLogs(selectedEmpresa);
  const { data: empresas } = useAllEmpresas();

  const logMetrics = [
    {
      title: "Total de Logs",
      value: logsData?.totalLogs || 0,
      subtitle: "Últimos 7 dias",
      icon: <AlertTriangle className="w-5 h-5 text-primary" />,
      trend: "neutral" as const,
      trendValue: undefined
    },
    {
      title: "Erros Críticos",
      value: logsData?.criticalErrors || 0,
      subtitle: "Precisam atenção",
      icon: <XCircle className="w-5 h-5 text-destructive" />,
      trend: "neutral" as const,
      trendValue: undefined
    },
    {
      title: "Warnings",
      value: logsData?.warnings || 0,
      subtitle: "Alertas gerais",
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      trend: "neutral" as const,
      trendValue: undefined
    },
    {
      title: "Info Logs",
      value: logsData?.infoLogs || 0,
      subtitle: "Logs informativos",
      icon: <Info className="w-5 h-5 text-blue-500" />,
      trend: "neutral" as const,
      trendValue: undefined
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'error':
      case 'critical':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent':
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
      case 'whatsapp':
        return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Logs do Sistema</h1>
            <p className="text-muted-foreground">Monitore erros, alertas e atividades do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Logs
            </Button>
            <Button>
              <Eye className="w-4 h-4 mr-2" />
              Tempo Real
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {logMetrics.map((metric, index) => (
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por mensagem, sessão ou workflow..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedEmpresa?.toString() || "all"} onValueChange={(value) => setSelectedEmpresa(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {empresas?.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.name_empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Hoje</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Avançado
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Sessão</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData?.logs?.slice(0, 20).map((log: any, index: number) => (
                    <TableRow key={log.id || index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <span className="capitalize">{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(log.severity || 'info')}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {log.sessionid?.slice(0, 8) || 'N/A'}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {log.workflowname || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-xs block">
                          {log.description || log.message || 'Sem descrição'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum log encontrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Log Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Agent</span>
                  </div>
                  <span className="text-sm font-medium">{logsData?.agentLogs || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <span className="text-sm font-medium">{logsData?.whatsappLogs || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logs Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logsData?.recentLogs?.slice(0, 5).map((log: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    {getSeverityBadge(log.severity)}
                    <span className="text-sm flex-1 truncate">
                      {log.description || log.message || 'Log sem descrição'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum log recente encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
