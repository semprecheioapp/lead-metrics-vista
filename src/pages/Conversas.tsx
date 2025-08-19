import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Filter, Download, Eye, Bot, User, Calendar } from "lucide-react";
import { useState } from "react";
import { useMemoriaMetrics } from "@/hooks/useMemoriaMetrics";
import { useConversasIA } from "@/hooks/useConversasIA";
import { ChatAoVivo } from "@/components/ChatAoVivo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Conversas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("7d");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  const { data: memoriaData, isLoading: memoriaLoading } = useMemoriaMetrics();
  const { data: conversasData, isLoading: conversasLoading } = useConversasIA();

  const isLoading = memoriaLoading || conversasLoading;

  const conversationMetrics = [
    {
      title: "Total de Conversas",
      value: memoriaData?.totalSessions || 0,
      subtitle: "Últimos 7 dias",
      icon: <MessageSquare className="w-5 h-5 text-primary" />,
      trend: "up" as const,
      trendValue: "+12%"
    },
    {
      title: "Sessões Ativas",
      value: conversasData?.activeSessions || 0,
      subtitle: "Agora",
      icon: <Bot className="w-5 h-5 text-primary" />,
      trend: "neutral" as const,
      trendValue: "0%"
    },
    {
      title: "Média por Sessão",
      value: `${conversasData?.averageMessages || 0} msgs`,
      subtitle: "Mensagens por conversa",
      icon: <User className="w-5 h-5 text-primary" />,
      trend: "up" as const,
      trendValue: "+8%"
    },
    {
      title: "Tokens Utilizados",
      value: conversasData?.totalTokens || 0,
      subtitle: "Este mês",
      icon: <Calendar className="w-5 h-5 text-primary" />,
      trend: "up" as const,
      trendValue: "+15%"
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conversas IA</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Chat ao vivo e histórico de conversas com assistente IA</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Conversas
            </Button>
            <Button size="sm" className="text-xs sm:text-sm">
              <Eye className="w-4 h-4 mr-2" />
              Modo Tempo Real
            </Button>
          </div>
        </div>

        {/* Tabs for Chat and Analytics */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat ao Vivo</TabsTrigger>
            <TabsTrigger value="analytics">Análise & Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatAoVivo />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {conversationMetrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  subtitle={metric.subtitle}
                  icon={metric.icon}
                  trend={metric.trend}
                  trendValue={metric.trendValue}
                  className="text-center sm:text-left"
                />
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filtros e Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por sessão, conteúdo ou data..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">Últimas 24h</SelectItem>
                        <SelectItem value="7d">Últimos 7 dias</SelectItem>
                        <SelectItem value="30d">Últimos 30 dias</SelectItem>
                        <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros Avançados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Conversas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                    {conversasData?.conversations?.slice(0, 10).map((conversa: any, index: number) => (
                      <div 
                        key={conversa.session_id || index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer touch-manipulation active:bg-accent"
                        onClick={() => setSelectedSession(conversa.session_id)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-xs sm:text-sm truncate">
                              Sessão: {conversa.session_id?.slice(0, 8) || 'N/A'}...
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {conversa.data_atual || 'Data não disponível'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {conversa.tokens_used || 0}
                          </Badge>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm">Nenhuma conversa encontrada</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Conversa</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSession ? (
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <h3 className="font-medium">Sessão: {selectedSession}</h3>
                        <p className="text-sm text-muted-foreground">Clique em uma conversa para ver os detalhes</p>
                      </div>
                      <div className="space-y-3">
                        {/* Aqui viriam as mensagens da conversa selecionada */}
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">IA</span>
                          </div>
                          <p className="text-sm">Olá! Como posso ajudá-lo hoje?</p>
                        </div>
                        <div className="bg-accent p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">Cliente</span>
                          </div>
                          <p className="text-sm">Gostaria de agendar um horário</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione uma conversa para ver os detalhes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{memoriaData?.totalSessions || 0}</div>
                    <div className="text-sm text-muted-foreground">Sessões Totais</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {memoriaData?.messagesByDay?.reduce((acc, day) => acc + day.count, 0) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Mensagens Totais</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {conversasData?.averageTokensPerSession || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Tokens/Sessão</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}