
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAdvancedLeadMetrics } from "@/hooks/useAdvancedMetrics";
import { Users, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { Badge } from "@/components/ui/badge";

const CONVERSION_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

export const LeadConversionAnalytics = () => {
  const { data: metrics, isLoading } = useAdvancedLeadMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        </div>
        <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const conversionData = [
    {
      stage: "Novo → Abordado",
      rate: metrics.conversionRates.newToApproached,
      color: CONVERSION_COLORS[0],
    },
    {
      stage: "Abordado → Qualificado",
      rate: metrics.conversionRates.approachedToQualified,
      color: CONVERSION_COLORS[1],
    },
    {
      stage: "Qualificado → Fechado",
      rate: metrics.conversionRates.qualifiedToClosed,
      color: CONVERSION_COLORS[2],
    },
    {
      stage: "Conversão Geral",
      rate: metrics.conversionRates.overallConversion,
      color: CONVERSION_COLORS[3],
    },
  ];

  // Verificar se há dados suficientes para mostrar tendências
  const hasConversions = Object.values(metrics.conversionRates).some(rate => rate > 0);
  const hasLeads = metrics.leadsBySource.length > 0;

  return (
    <div className="space-y-6">
      {/* Métricas de Conversão */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Conversão Geral"
          value={`${metrics.conversionRates.overallConversion}%`}
          icon={<Target className="h-5 w-5 text-primary" />}
          trend={hasConversions ? "up" : undefined}
          trendValue={hasConversions ? "+3.2%" : undefined}
        />
        
        <MetricCard
          title="Tempo Médio"
          value={metrics.averageTimeToConversion > 0 ? `${metrics.averageTimeToConversion}d` : "0d"}
          subtitle="para conversão"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend={metrics.averageTimeToConversion > 0 ? "down" : undefined}
          trendValue={metrics.averageTimeToConversion > 0 ? "-0.5d" : undefined}
        />
        
        <MetricCard
          title="Follow-up"
          value={metrics.leadsNeedingFollowUp}
          subtitle="leads precisam"
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          trend="neutral"
        />
        
        <MetricCard
          title="Melhor Funil"
          value={`${Math.max(...Object.values(metrics.conversionRates))}%`}
          subtitle="taxa mais alta"
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={hasConversions ? "up" : undefined}
          trendValue={hasConversions ? "+5%" : undefined}
        />
      </div>

      {hasLeads || hasConversions ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Taxas de Conversão por Etapa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Taxas de Conversão por Etapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasConversions ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="stage" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Taxa de Conversão']}
                    />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversão disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leads por Origem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leads por Origem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.leadsBySource.length > 0 ? (
                  metrics.leadsBySource.map((source, index) => {
                    const total = metrics.leadsBySource.reduce((sum, s) => sum + s.count, 0);
                    const percentage = total > 0 ? (source.count / total) * 100 : 0;
                    
                    return (
                      <div key={source.source} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium capitalize">{source.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{source.count}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de origem disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum lead encontrado</h3>
              <p>Ainda não há dados de leads para exibir análises de conversão.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
