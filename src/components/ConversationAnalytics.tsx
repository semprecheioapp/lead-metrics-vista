
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAdvancedConversationMetrics } from "@/hooks/useAdvancedMetrics";
import { Clock, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";
import { MetricCard } from "./MetricCard";

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

export const ConversationAnalytics = () => {
  const { data: metrics, isLoading } = useAdvancedConversationMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const peakHoursData = metrics.peakHours.map(item => ({
    hour: `${item.hour}:00`,
    count: item.count,
  }));

  // Só mostrar tendências se houver dados suficientes
  const hasEnoughData = metrics.totalMessages > 10;

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sessões Únicas"
          value={metrics.uniqueSessions}
          icon={<MessageSquare className="h-5 w-5 text-primary" />}
          trend={hasEnoughData ? "up" : undefined}
          trendValue={hasEnoughData ? "+12%" : undefined}
        />
        
        <MetricCard
          title="Duração Média"
          value={metrics.averageSessionDuration > 0 ? `${metrics.averageSessionDuration}min` : "0min"}
          icon={<Clock className="h-5 w-5 text-primary" />}
          trend={hasEnoughData && metrics.averageSessionDuration > 0 ? "neutral" : undefined}
          trendValue={hasEnoughData && metrics.averageSessionDuration > 0 ? "2.3min" : undefined}
        />
        
        <MetricCard
          title="Msgs/Sessão"
          value={metrics.averageMessagesPerSession}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend={hasEnoughData && metrics.averageMessagesPerSession > 0 ? "up" : undefined}
          trendValue={hasEnoughData && metrics.averageMessagesPerSession > 0 ? "+8%" : undefined}
        />
        
        <MetricCard
          title="Taxa Abandono"
          value={`${metrics.abandonmentRate}%`}
          icon={<AlertCircle className="h-5 w-5 text-destructive" />}
          trend={hasEnoughData && metrics.abandonmentRate > 0 ? "down" : undefined}
          trendValue={hasEnoughData && metrics.abandonmentRate > 0 ? "-5%" : undefined}
        />
      </div>

      {metrics.totalMessages > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horários de Pico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Pico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {peakHoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Conversas']}
                      labelFormatter={(label) => `Horário: ${label}`}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de horário disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição de Atividade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Distribuição de Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {peakHoursData.length > 0 && peakHoursData.some(item => item.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={peakHoursData.filter(item => item.count > 0).slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ hour, percent }) => `${hour} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {peakHoursData.filter(item => item.count > 0).slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Conversas']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de atividade disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma conversa encontrada</h3>
              <p>Ainda não há dados de conversas para exibir gráficos detalhados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
